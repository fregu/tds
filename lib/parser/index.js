/**
  const tree = parseTree(__dirname)

  return flatMap(parseTree).map(extendComponent)
**/
const fs = require("fs");
const path = require("path");
const parseTree = require("directory-tree");
const ignoreFiles = ["dist", "node_modules"];
const dotenv = require("dotenv");
dotenv.config();

const watchFiles = [
  {
    type: "file",
    test: /babelrc/,
    resolve(item, config) {
      config.babelrc = item.path;
    }
  },
  {
    type: "file",
    test: /webpack.config.js/,
    resolve(item, config) {
      config.webpack = item.path;
    }
  },
  {
    type: "directory",
    test: /^schema|graphql|gql$/i,
    resolve(item, config) {
      const graphqlConfig = {};
      const typeDirectory = item.children.find(
        subItem => subItem.name === "types"
      );
      const resolversDirectory = item.children.find(
        subItem => subItem.name === "resolvers"
      );
      if (typeDirectory && typeDirectory.children) {
        graphqlConfig.typeDefs = flattenChildren(typeDirectory.children)
          .map(child => fs.readFileSync(child.path).toString())
          .join("\n");
      }
      if (resolversDirectory && resolversDirectory.children) {
        const resolver = resolversDirectory.children.find(
          subItem =>
            subItem.name === "index.js" || subItem.name === "resolvers.js"
        );
        graphqlConfig.resolvers = resolver ? resolver.path : null;
      }
      const schemaFile = item.children.find(
        subItem => subItem.name === "index.js" || subItem.name === "schema.js"
      );

      if (schemaFile) {
        graphqlConfig.schema = schemaFile;
      }
      config.graphql = {
        ...(config.graphql || {}),
        ...graphqlConfig
      };
    }
  },
  {
    type: "directory",
    test: /^assets$/i,
    resolve(item, config) {
      config.paths.assets = item.path;

      config.src.assets = {
        icons: (
          item.children.find(child => child.name.match(/icons/)) || {
            children: []
          }
        ).children
          .filter(subChild => subChild.name.match(/\.svg$/))
          .reduce(
            (icons, subChild) => ({
              ...icons,
              [subChild.name
                .replace(/\.svg$/, "")
                .replace(/[ -]/g, "")]: subChild.path
            }),
            {}
          ),
        images: (
          item.children.find(child => child.name.match(/images/)) || {
            children: []
          }
        ).children
          .filter(subChild =>
            subChild.name.match(/\.(jpe?g|png|gif|svg|webm)$/)
          )
          .map(subChild => subChild.path),
        fonts: (
          item.children.find(child => child.name.match(/fonts/)) || {
            children: []
          }
        ).children
          .filter(subChild => subChild.name.match(/\.(woff|tft|otf|eot|svg)$/))
          .map(subChild => subChild.path)
      };
    }
  },
  {
    type: "directory",
    test: /^components|bricks$/i,
    resolve(item, config) {
      config.paths.components = item.path;
      config.src.components = [
        ...(config.src.components || []),
        ...parseComponents(item.children, config)
      ];
    }
  },
  {
    type: "directory",
    test: /^containers|modules|kits$/i,
    resolve(item, config) {
      config.paths.containers = item.path;
      config.src.containers = [
        ...(config.src.containers || []),
        ...parseComponents(item.children, config)
      ];
    }
  },
  {
    type: "directory",
    test: /^views|pages|constructions$/i,
    resolve(item, config) {
      config.paths.views = item.path;
      config.src.views = [
        ...(config.src.views || []),
        ...parseComponents(item.children, config)
      ];
    }
  },
  {
    type: "directory",
    test: /^patterns|base|instructions$/i,
    resolve(item, config) {
      config.paths.patterns = item.path;
      const cssIndex = item.children.find(child =>
        child.name.match(/index\.(s?css|less|styl)/)
      );
      if (cssIndex) {
        config.cssIndex = cssIndex.path;
      }
      config.src.patterns = [
        ...(config.src.patterns || []),
        ...parseComponents(item.children, config)
      ];
    }
  },
  {
    type: "directory",
    test: /^layouts?|plates$/i,
    resolve(item, config) {
      config.paths.layouts = item.path;
      config.src.layouts = [
        ...(config.src.layouts || []),
        ...parseComponents(item.children, config)
      ];
    }
  },
  {
    type: "directory",
    test: /^store$/i,
    resolve(item, config) {
      const reducers = item.children.find(
        subItem => subItem.name === "reducers"
      );
      const middlewares = item.children.find(
        subItem => subItem.name === "middlewares"
      );
      const index = item.children.find(subItem =>
        subItem.name.match(new RegExp(`^(index|main|${item.name}).(jsx?|ts)$`))
      );
      config.store = {
        ...config.store,
        index: index && index.path,
        reducers: [
          ...((config.store && config.store.reducers) || []),
          ...((reducers &&
            reducers.children &&
            parseScripts(reducers.children, config)) ||
            (reducers && reducers.type === "file" && [reducers.path]) ||
            [])
        ],
        middlewares: [
          ...((config.store && config.store.middlewares) || []),
          ...((middlewares &&
            middlewares.children &&
            parseScripts(middlewares.children, config)) ||
            (middlewares &&
              middlewares.type === "file" && [middlewares.path]) ||
            [])
        ]
      };
    }
  }
];

const defaultConfig = {
  mode: process.env.NODE_ENV || "development",
  src: {},
  env: {}
};

function flattenChildren(array = []) {
  return array.reduce(
    (flatArray, child) => [
      ...flatArray,
      ...(child.children ? flattenChildren(child.children) : [child])
    ],
    []
  );
}

function parseScripts(items, config) {
  return items.reduce((scripts, item) => {
    if (item.children) {
      return [...scripts, ...parseScripts(item.children)];
    } else if (item.type === "file" && item.name.match(/\.m?jsx?$/)) {
      return [...scripts, item.path];
    }
    return scripts;
  }, []);
}
function parseComponents(components = [], config) {
  return components.map(item => {
    if (item.children) {
      return item.children.reduce((component, subItem) => {
        if (subItem.type === "file") {
          // Component has script component file
          if (
            subItem.name.match(
              new RegExp(`^(index|main|${item.name}).(jsx?|ts)$`)
            )
          ) {
            component.filePath = subItem.path;
            component.name = item.name;
            component.path = item.path;
            component.fullPath = path.resolve(config.path, "..", item.path);
          }
          const content = fs.readFileSync(subItem.path).toString();
          component.files = [
            ...(component.files || []),
            { ...subItem, content }
          ];

          if (subItem.name.match(new RegExp(`.mdx?$`))) {
            component.documentation = subItem.path;
          }
          if (subItem.name.match(/(data|props)\.(json|js)?$/)) {
            component.data = subItem.path;
          }
        } else if (subItem.type === "directory") {
          component.children = parseComponents(subItem.children, config);
        }
        return component;
      }, {});
    } else if (item.type === "file") {
      const content = fs.readFileSync(item.path).toString();
      return { ...item, content };
    }
  });
}
function parseItems(items = [], config) {
  return items.forEach(item => {
    if (!ignoreFiles.includes(item.name)) {
      const watchFile = watchFiles.find(
        watchCase =>
          (!watchCase.type || watchCase.type === item.type) &&
          watchCase.test.test(item.name)
      );
      if (watchFile) {
        watchFile.resolve(item, config);
      } else if (item.children) {
        parseItems(item.children, config);
      }
    }
  });
}
module.exports = function(dir) {
  const tree = parseTree(dir, {
    exclude: /(node_modules|dist|lib|kit|bin|vendor|bower_components)/
  });
  const configFile = tree.children.find(child =>
    child.name.match(/tds\.config\.(js|json)/)
  );
  const entry = tree.children.find(
    child =>
      child.type === "file" &&
      child.name.match(new RegExp(`^(index|main|App).(jsx?|ts)$`, "i"))
  );
  const docs = tree.children.find(
    child => child.type === "directory" && child.name.match(/docs/)
  );
  let nodeModules = [];
  let hasTdsUI;
  let tdsUiPath;
  try {
    nodeModules = fs
      .readdirSync(path.resolve(dir, "node_modules"))
      .filter(f =>
        fs
          .lstatSync(path.join(path.resolve(dir, "node_modules"), f))
          .isDirectory()
      );
    try {
      tdsUiPath = path.join("node_modules", "@jayway", "tds-ui");

      hasTdsUI = !!(
        fs.lstatSync(path.resolve(dir, tdsUiPath)).isDirectory ||
        fs.lstatSync(path.resolve(dir, tdsUiPath)).isSymbolicLink
      );
    } catch (err) {
      //console.warn("tds-ui not found");
    }
  } catch (err) {
    console.warn("Node_modules not found");
  }
  const localModules = [
    "react",
    "react-dom",
    "redux",
    "react-redux",
    "graphql",
    "react-router-dom",
    "react-router",
    "react-apollo"
  ];

  const tdsConfig = configFile
    ? require(path.resolve(dir, configFile.path))
    : {};
  const config = {
    ...defaultConfig,
    ...tdsConfig,
    rootFiles: fs
      .readdirSync(dir)
      .filter(f => fs.lstatSync(path.resolve(dir, f)).isFile()),
    entry: tdsConfig.entry || (entry && entry.path),
    alias: {
      ...(hasTdsUI ? { ui: path.resolve(tdsUiPath, "src") } : {}),
      ...(tdsConfig.alias || {})
    },
    store: {
      ...(tdsConfig.store || {}),
      reducers: [
        ...((tdsConfig.store && tdsConfig.store.reducers) || []),
        ...(hasTdsUI
          ? [path.join(tdsUiPath, "src/store/reducers/index.js")]
          : [])
      ],
      middlewares: [
        ...((tdsConfig.store && tdsConfig.store.middlewares) || []),
        ...(hasTdsUI
          ? [path.join(tdsUiPath, "src/store/middlewares/index.js")]
          : [])
      ]
    },
    tdsUI: hasTdsUI,
    path: path.resolve(dir),
    paths: {
      root: path.resolve(dir),
      dist: path.resolve(tree.path, "dist"),
      ...((docs && { docs: docs.path }) || {}),
      ...({ ui: tdsUiPath } || {})
    },
    // If local versions are installed, preferrably use them to prevent conflicts
    node_modules: {
      ...localModules.reduce(
        (list, module) => ({ ...list, [module]: nodeModules.includes(module) }),
        {}
      )
    }
  };
  parseItems(tree.children, config);

  return config;
};
