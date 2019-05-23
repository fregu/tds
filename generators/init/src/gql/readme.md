# GraphQL

GraphQL is a API query language very much suited for React. It can be used to resolve multiple REST requests in a single client-request. This is possible due to the GraphQL server which creates a schema based on types and resolvers defined in this directory, and automatically creates a API ready for your application to use.

## Types

Schemas and Types (https://graphql.org/learn/schema/)

GraphQL types are defined in `gql` files defining any request with its subfields and their field types. The root types are `Query` for fetching data and `Mutation` for manipulating data.

```gql
type Query {
  getPosts: [Post]
  getPost(id: ID!): Post
}
type Post {
  id: ID!
  title: String!
  content: String
  slug: String
}
```

```gql
type Mutation {
  createPost((title: String!, content: String)) : Post!
}
```

## Resolvers

Resolvers are javascript methods which make necessary requests to serve the schema with data. You can create resolvers for each Type and their subfields.

```js
const resolvers = {
  Query: {
    getPosts: (root, args, ctx) => axios.get('https://myApi/posts'),
    getPost: (root, { id }, ctx) => axios.get(`https://myApi/posts/${id}`)
  },
  Mutation: {
    createPost: (root, { title, content }, ctx) =>
      axios.post('https://myApi/posts', { title, content })
  },
  Post: {
    // Custom field resolver
    slug: ({ title }) => title.toLowerCase().replace(/[ -]/g, '')
  }
}
```

Using `@jayway/tds` types and resolvers will auomatically be imported into a schema which the server will serve. You can additionally import external GraqhQL schemas from remote servers, by defining them in as graphql.remoteSchemas in `tds.config.js`
