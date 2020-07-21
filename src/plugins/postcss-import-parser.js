import { promisify } from 'util';

import postcss from 'postcss';
import valueParser from 'postcss-value-parser';

import {
  normalizeUrl,
  resolveRequests,
  isUrlRequestable,
  requestify,
} from '../utils';

const pluginName = 'postcss-import-parser';

function walkAtRules(css, result, options, callback) {
  const accumulator = [];

  css.walkAtRules(/^import$/i, (atRule) => {
    // Convert only top-level @import
    if (atRule.parent.type !== 'root') {
      return;
    }

    // Nodes do not exists - `@import url('http://') :root {}`
    if (atRule.nodes) {
      result.warn(
        "It looks like you didn't end your @import statement correctly. Child nodes are attached to it.",
        { node: atRule }
      );

      return;
    }

    const { nodes: paramsNodes } = valueParser(atRule.params);

    // No nodes - `@import ;`
    // Invalid type - `@import foo-bar;`
    if (
      paramsNodes.length === 0 ||
      (paramsNodes[0].type !== 'string' && paramsNodes[0].type !== 'function')
    ) {
      result.warn(`Unable to find uri in "${atRule.toString()}"`, {
        node: atRule,
      });

      return;
    }

    let isStringValue;
    let url;

    if (paramsNodes[0].type === 'string') {
      isStringValue = true;
      url = paramsNodes[0].value;
    } else {
      // Invalid function - `@import nourl(test.css);`
      if (paramsNodes[0].value.toLowerCase() !== 'url') {
        result.warn(`Unable to find uri in "${atRule.toString()}"`, {
          node: atRule,
        });

        return;
      }

      isStringValue =
        paramsNodes[0].nodes.length !== 0 &&
        paramsNodes[0].nodes[0].type === 'string';
      url = isStringValue
        ? paramsNodes[0].nodes[0].value
        : valueParser.stringify(paramsNodes[0].nodes);
    }

    // Empty url - `@import "";` or `@import url();`
    if (url.trim().length === 0) {
      result.warn(`Unable to find uri in "${atRule.toString()}"`, {
        node: atRule,
      });

      return;
    }

    accumulator.push({
      atRule,
      url,
      isStringValue,
      mediaNodes: paramsNodes.slice(1),
    });
  });

  callback(null, accumulator);
}

const asyncWalkAtRules = promisify(walkAtRules);

export default postcss.plugin(pluginName, (options) => async (css, result) => {
  const parsedResults = await asyncWalkAtRules(css, result, options);

  if (parsedResults.length === 0) {
    return Promise.resolve();
  }

  const imports = new Map();
  const tasks = [];

  for (const parsedResult of parsedResults) {
    const { atRule, url, isStringValue, mediaNodes } = parsedResult;

    let normalizedUrl = url;
    let prefix = '';

    const queryParts = normalizedUrl.split('!');

    if (queryParts.length > 1) {
      normalizedUrl = queryParts.pop();
      prefix = queryParts.join('!');
    }

    // eslint-disable-next-line no-console
    console.log(parsedResult);
    // eslint-disable-next-line no-console
    console.log(normalizedUrl);

    const isRequestable = isUrlRequestable(normalizedUrl);

    if (isRequestable) {
      normalizedUrl = normalizeUrl(normalizedUrl, isStringValue);

      // eslint-disable-next-line no-console
      console.log(normalizedUrl);

      // Empty url after normalize - `@import '\
      // \
      // \
      // ';
      if (normalizedUrl.trim().length === 0) {
        result.warn(`Unable to find uri in "${atRule.toString()}"`, {
          node: atRule,
        });

        // eslint-disable-next-line no-continue
        continue;
      }
    }

    let media;

    if (mediaNodes.length > 0) {
      media = valueParser.stringify(mediaNodes).trim().toLowerCase();
    }

    if (options.filter && !options.filter({ url: normalizedUrl, media })) {
      // eslint-disable-next-line no-continue
      continue;
    }

    atRule.remove();

    if (isRequestable) {
      const request = requestify(normalizedUrl, options.rootContext);

      // eslint-disable-next-line no-console
      console.log(request);

      const doResolve = async () => {
        const { resolver, context } = options;
        const resolvedUrl = await resolveRequests(resolver, context, [
          ...new Set([request, normalizedUrl]),
        ]);

        return { url: resolvedUrl, media, prefix, isRequestable };
      };

      tasks.push(doResolve());
    } else {
      tasks.push({ url, media, prefix, isRequestable });
    }
  }

  const results = await Promise.all(tasks);

  for (let index = 0; index <= results.length - 1; index++) {
    const { url, isRequestable, media } = results[index];

    if (isRequestable) {
      const { prefix } = results[index];
      const newUrl = prefix ? `${prefix}!${url}` : url;
      const importKey = prefix ? newUrl : url;
      let importName = imports.get(importKey);

      if (!importName) {
        importName = `___CSS_LOADER_AT_RULE_IMPORT_${imports.size}___`;
        imports.set(importKey, importName);

        result.messages.push({
          type: 'import',
          value: {
            order: 1,
            importName,
            url: options.urlHandler(newUrl),
            index,
          },
        });
      }

      result.messages.push({
        type: 'api-import',
        value: { order: 1, type: 'internal', importName, media, index },
      });

      // eslint-disable-next-line no-continue
      continue;
    }

    result.messages.push({
      pluginName,
      type: 'api-import',
      value: { order: 1, type: 'external', url, media, index },
    });
  }

  return Promise.resolve();
});
