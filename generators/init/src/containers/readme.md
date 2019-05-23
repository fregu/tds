# Containers

Container is a common name for a React component with application logic. They can make API requests, manipulate Redux state or be specific collections of components for a single purpose.

Your UI-element might just be a Container if

- It is used only once or twice.
- It will be used only in one place in the application.
- It makes "hard-coded" decisions which can't be controlled by properties
- It doesn't make sence documenting for reuse in a styleguide.
- It is imported rather than based on URL
