# Assets

Assets contains of all importable static files used in the sollution, like fonts, images, icons or linked files.

When importing a file from assets, it will be loaded using a specific loader to handle its specific type.

## Images

Image files imported from the `images` directory will export a the URL to that asset after it has been build. For `.png` or `.jpg` files they will export an object containing srcSet for scaled images and also a src with the default size. (however they can still be used like any other image just using the export object as url)

```js
import myFile from 'assets/images/myfile.jpg'
import { src, srcSet } from 'assets/images/myfile2.jpg'

export default () => (
  <div>
    <img src={myFile} />
    <img src={src} srcSet={srcSet} />
  </div>
)
```

## Icons

Icons with file-format `.svg` imported from the `icons` directory will automatically be stripped of unessecary definitionas and styling and export the svg source.

This way they can be inserted in the DOM

```js
import myIcon from 'assets/icons/myIcon.svg'

export default () => (
  <div>
    <span dangerouslySetInnerHTML={{ __html: myIcon }} />
  </div>
)
```

Or by using the `tds-ui` `<Icon />` component, which automatically imports any icon you place in the `assets/icons` directory ready to use.

```js
import Icon from 'ui/components/Icon'

export default () => (
  <div>
    {/* renderes assets/icons/myIcon.svg */}
    <Icon type="myIcon" />
  </div>
)
```

## Fonts

Fonts can be placed in the `fonts` directory. They will (if imported) be copied to the dist folder on build time, exporting their current URL to you CSS file.

```css
@font-face {
  font-family: 'MyFont';
  font-weight: normal;
  font-style: normal;
  src: url('/assets/fonts/myFont.woff');
}
```
