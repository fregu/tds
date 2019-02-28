const mongoose = require("mongoose");

module.exports = function initDB({ host, user, password, port, path }) {
  mongoose.connect(
    `mongodb://${user}:${password}@${host}:${port}${path ? `/${path}` : ""}`,
    { useNewUrlParser: true }
  );

  mongoose.connection.once("open", () => {
    console.log("connected to database");
  });

  // Get types from db and defaults
  // Get models from db

  // Setup rest api endpoints list(type, where), get(id), post(type, data) put(id, data), delete(id)
  // Return object with each model and endpoints

  /*
  {
    getPosts: {
      method: 'GET',
      path: '/posts',
      action: (where) => db.posts.findAll({where})
    },
    getPost: {
      method: 'GET',
      path: '/post/{id}',
      action: (id) => db.posts.find({where: {model: 'Post', id: id}})
    },
    createPost: {
      mwthod: 'POST',
      path: '/posts',
      action: (request) => db.posts.insert({where: {model: 'Post'}}, request)
    },
    updatePost: {
      mwthod: 'PUT',
      path: '/post/{id}',
      action: (id, request) => db.posts.upsert({where: {model: 'Post', id: id}}, request)
    },
    deletePost: {
      mwthod: 'DELETE',
      path: '/post/{id}',
      action: (id) => db.posts.delete({where: {model: 'Post', id: id}})
    }
    ...
  }

  */
  // Make graphql schema from types
  // Generate resolvers, queries and mutations for each model and endpoint
};

/**
  Koa-mongoose

  MongoDB / fileSystem (json)

    data/posts.json
      {
        model: 'Post',
        schema: {
          ID: 'ID',
          title: 'String',
          content: 'Html',
          image: 'Image',
          reference: 'Reference'
        },
        data: [
          {
            ID: '1',
            title: 'Test',
            content: '## Testcontent',
            image: null,
            reference: {
              model: 'Post',
              id: '2'
            },
            createdAt: '2019-02-10 11:25',
            createdBy: 1,
            lastUpdatedAt: '2019-02-10 11:27',
            lastUpdatedBy: 1,
          }
        ]
      }
  CMS
    - Types
      {
        ID: '',
        String: '',
        Enum: [],
        Image: {
          url: '',
          size: {
            width: 'auto',
            height: 'auto'
          }
        },
        Wysiwyg: '',
        Reference: {
          model: 'Post',
          id:
        }
      }
    - Models
      {
        name: 'Post',
        collection: 'Posts',
        id: {type: ID},
        status: {
          type: Enum,
          options: ['DRAFT', 'PUBLISHED', 'ARCHIVED']
        }
        title: {type: String},
        content: {type: Wysiwyg, html: true},
        fields: {
          type: {type: Enum, options: ['PRIMARY', 'SECONDARY', 'TERTIARY']},
          image: {type: Image, size: {width: 'auto', height: 'auto'}},
          referenceTo: {type: Reference, model: 'Post'}
        },
        created: {
          at: {type: DateString},
          by: {type: UserId}
        },
        updated: {
          at: {type: DateString},
          by: {type: UserId}
        }
      }
    - Content
      {Posts: [
        {
          id: '123',
          title: 'Hello Worlds',
          content: 'This is an example',
          image: null,
          referenceTo: {model: 'Post', id: '124'}
          status: 'DRAFT',
          created: {
            at: '2019-02-10 11:23',
            by: {id: 1, firstName: 'Fredrik', surname: 'Söderquist', email: 'fregu808@gmail.com'}
          },
          updated: {
            at: '2019-02-10 11:23',
            by: {id: 1, firstName: 'Fredrik', surname: 'Söderquist', email: 'fregu808@gmail.com'}
          }
        }
      ]}
    - Users
      {
        id: {type: Id},
        firstName: {type: String},
        surname: {type: String},
        email: {type: String},
        role: {type: Enum, options: ['USER', 'EDITOR', 'ADMINISTRATOR']},
        avatar: {type: Image, size: {width: 200, height: 200}}
      }
**/
