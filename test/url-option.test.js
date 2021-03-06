import fs from "fs";
import path from "path";

import webpack from "webpack";

import {
  compile,
  getCompiler,
  getErrors,
  getExecutedCode,
  getModuleSource,
  getWarnings,
} from "./helpers/index";

const isWebpack5 = webpack.version.startsWith(5);

describe('"url" option', () => {
  it("should work when not specified", async () => {
    const compiler = getCompiler("./url/url.js");
    const stats = await compile(compiler);

    expect(getModuleSource("./url/url.css", stats)).toMatchSnapshot("module");
    expect(getExecutedCode("main.bundle.js", compiler, stats)).toMatchSnapshot(
      "result"
    );
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats)).toMatchSnapshot("errors");
  });

  it('should work with a value equal to "true"', async () => {
    const compiler = getCompiler("./url/url.js", { url: true });
    const stats = await compile(compiler);

    expect(getModuleSource("./url/url.css", stats)).toMatchSnapshot("module");
    expect(getExecutedCode("main.bundle.js", compiler, stats)).toMatchSnapshot(
      "result"
    );
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats)).toMatchSnapshot("errors");
  });

  it('should work with a value equal to "false"', async () => {
    const compiler = getCompiler("./url/url.js", { url: false });
    const stats = await compile(compiler);

    expect(getModuleSource("./url/url.css", stats)).toMatchSnapshot("module");
    expect(getExecutedCode("main.bundle.js", compiler, stats)).toMatchSnapshot(
      "result"
    );
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats)).toMatchSnapshot("errors");
  });

  it('should work with a value equal to "Function"', async () => {
    const compiler = getCompiler("./url/url.js", {
      url: (url, resourcePath) => {
        expect(typeof resourcePath === "string").toBe(true);

        if (url.startsWith("/guide/img")) {
          return false;
        }

        // Don't handle `img.png`
        if (url.includes("img.png")) {
          return false;
        }

        return true;
      },
    });
    const stats = await compile(compiler);

    expect(getModuleSource("./url/url.css", stats)).toMatchSnapshot("module");
    expect(getExecutedCode("main.bundle.js", compiler, stats)).toMatchSnapshot(
      "result"
    );
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats)).toMatchSnapshot("errors");
  });

  it("should resolve absolute path", async () => {
    // Create the file with absolute path
    const fileDirectory = path.resolve(__dirname, "fixtures", "url");
    const file = path.resolve(fileDirectory, "url-absolute.css");
    const absolutePath = path.resolve(fileDirectory, "img.png");
    const code = `
.background {
  background: url(${absolutePath});
}

.background-other {
  background: url(${absolutePath.replace(/e/g, "%65")});
}

.background-other {
  background: url('${absolutePath.replace(/e/g, "\\\ne")}');
}
`;

    fs.writeFileSync(file, code);

    const compiler = getCompiler("./url/url-absolute.js");
    const stats = await compile(compiler);

    expect(getModuleSource("./url/url-absolute.css", stats)).toMatchSnapshot(
      "module"
    );
    expect(getExecutedCode("main.bundle.js", compiler, stats)).toMatchSnapshot(
      "result"
    );
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats)).toMatchSnapshot("errors");
  });

  it('should resolve "file" protocol path', async () => {
    // Create the file with absolute path
    const fileDirectory = path.resolve(__dirname, "fixtures", "url");
    const file = path.resolve(fileDirectory, "url-file-protocol.css");
    const absolutePath = path
      .resolve(fileDirectory, "img.png")
      .replace(/\\/g, "/");
    const code = `
.background {
  background: url(file://${absolutePath});
}

.background-other {
  background: url(file://${absolutePath.replace(/e/g, "%65")});
}

.background-other {
  background: url('file://${absolutePath.replace(/e/g, "\\\ne")}');
}
`;

    fs.writeFileSync(file, code);

    const compiler = getCompiler("./url/url-file-protocol.js");
    const stats = await compile(compiler);

    expect(
      getModuleSource("./url/url-file-protocol.css", stats)
    ).toMatchSnapshot("module");
    expect(getExecutedCode("main.bundle.js", compiler, stats)).toMatchSnapshot(
      "result"
    );
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats)).toMatchSnapshot("errors");
  });

  it("should work with the 'asset' type of asset modules", async () => {
    const compiler = getCompiler(
      "./url/url.js",
      {},
      {
        module: {
          rules: [
            {
              test: /\.css$/i,
              use: [
                {
                  loader: path.resolve(__dirname, "../src"),
                  options: {},
                },
              ],
            },
            isWebpack5
              ? {
                  test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/i,
                  type: "asset",
                  generator: {
                    filename: "[name][ext]",
                  },
                }
              : {
                  test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/i,
                  loader: "url-loader",
                  options: {
                    limit: 8096,
                    name: "[name].[ext]",
                  },
                },
          ],
        },
      }
    );
    const stats = await compile(compiler);

    expect(getModuleSource("./url/url.css", stats)).toMatchSnapshot("module");
    expect(getExecutedCode("main.bundle.js", compiler, stats)).toMatchSnapshot(
      "result"
    );
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats)).toMatchSnapshot("errors");
  });

  it("should work with the 'asset/resource' type of asset modules", async () => {
    const compiler = getCompiler(
      "./url/url.js",
      {},
      {
        module: {
          rules: [
            {
              test: /\.css$/i,
              use: [
                {
                  loader: path.resolve(__dirname, "../src"),
                  options: {},
                },
              ],
            },
            isWebpack5
              ? {
                  test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/i,
                  type: "asset",
                  generator: {
                    filename: "[name][ext]",
                  },
                }
              : {
                  test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/i,
                  loader: "url-loader",
                  options: {
                    limit: 8096,
                    name: "[name].[ext]",
                  },
                },
          ],
        },
      }
    );
    const stats = await compile(compiler);

    expect(getModuleSource("./url/url.css", stats)).toMatchSnapshot("module");
    expect(getExecutedCode("main.bundle.js", compiler, stats)).toMatchSnapshot(
      "result"
    );
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats)).toMatchSnapshot("errors");
  });

  it("should work with the 'asset/inline' type of asset modules", async () => {
    const compiler = getCompiler(
      "./url/url.js",
      {},
      {
        module: {
          rules: [
            {
              test: /\.css$/i,
              use: [
                {
                  loader: path.resolve(__dirname, "../src"),
                  options: {},
                },
              ],
            },
            isWebpack5
              ? {
                  test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/i,
                  type: "asset/inline",
                }
              : {
                  test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/i,
                  loader: "url-loader",
                },
          ],
        },
      }
    );
    const stats = await compile(compiler);

    expect(getModuleSource("./url/url.css", stats)).toMatchSnapshot("module");
    expect(getExecutedCode("main.bundle.js", compiler, stats)).toMatchSnapshot(
      "result"
    );
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats)).toMatchSnapshot("errors");
  });

  it("should work with 'false' aliases", async () => {
    const compiler = getCompiler(
      "./url/false-alias.js",
      {},
      {
        module: {
          rules: [
            {
              test: /\.css$/i,
              loader: path.resolve(__dirname, "../src"),
            },
            isWebpack5
              ? {
                  test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/i,
                  type: "asset/resource",
                }
              : {
                  test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/i,
                  loader: "file-loader",
                  options: {
                    name: "[name].[ext]",
                  },
                },
          ],
        },
        resolve: {
          alias: {
            "/logo.png": isWebpack5
              ? false
              : path.resolve(__dirname, "./fixtures/url/logo.png"),
          },
        },
      }
    );
    const stats = await compile(compiler);

    // TODO uncomment after drop webpack v4
    // expect(getModuleSource("./url/false-alias.css", stats)).toMatchSnapshot(
    //   "module"
    // );
    // expect(getExecutedCode("main.bundle.js", compiler, stats)).toMatchSnapshot(
    //   "result"
    // );
    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats)).toMatchSnapshot("errors");
  });

  it("should throw an error on unresolved import", async () => {
    const compiler = getCompiler("./url/url-unresolved.js");
    const stats = await compile(compiler);

    expect(getWarnings(stats)).toMatchSnapshot("warnings");
    expect(getErrors(stats, true)).toMatchSnapshot("errors");
  });
});
