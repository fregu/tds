module.exports = ({ name, documentation, css, props, dependencies }) => `
import React, {Component} from "react"
import Connect from "../../store/Connect"
import PropsTable from "../../styleguide/PropsTable"
${documentation ? `import Documentation from '${documentation}'` : ''}

export default class StyleguideComponent extends Component {
  render() {
    return (
      <section className={'StyleguideComponent'}>
        <header className={'StyleguideComponent-header'}>
          <h2 className={'StyleguideComponent-title'}>${name}</h2>
        </header>
        <div className={'StyleguideComponent-content'}>
          ${props ? `<PropsTable props={${JSON.stringify(props)}} />` : ''}
          ${documentation ? `<Documentation />'` : ''}
        </div>
        <footer className={'StyleguideComponent-footer'}>
          ${dependencies ? `<Dependencies dependencies />'` : ''}
        </footer>
      </section>
    )
  }
}
`
