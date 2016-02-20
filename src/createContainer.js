import { Component, PropTypes, createElement } from 'react'
import { Observable } from 'rxjs/Observable'
import isPlainObject from 'lodash/isPlainObject'
import isArray from 'lodash/isPlainObject'
import hoistStatics from 'hoist-non-react-statics'
import invariant from 'invariant'

import { modelType } from './PropTypes'
import { toPaths } from './utils/toPaths'

const defaultInteractions = () => ({})

export function createContainer(WrappedComponent, { fragments, interactions = defaultInteractions }) {
  invariant(fragments, `There is no point of using createContainer
    for ${WrappedComponent.displayName || WrappedComponent.name}
    if you do not require data from model for it`
  )
  if (fragments.constructor !== Function || interactions.constructor !== Function) {
    invariant(null, `both fragments and interactions of
      ${WrappedComponent.displayName || WrappedComponent.name}
      must be Function instances`)
  }
  class Container extends Component {
    static displayName = `${WrappedComponent.displayName || WrappedComponent.name}Container`
    static contextTypes = {
      model: modelType.isRequired,
      intents: PropTypes.object.isRequired
    }
    static fragments = fragments // eslint-disable-line
    constructor(props, context) {
      super(props, context)
      const { model, intents } = context
      invariant(model,
        `Could not find "model" in the context
        of "${this.constructor.displayName}".
        Please wrap the root component in a <Provider>`
      )
      invariant(intents,
        `Could not find "intents" in the context
        of "${this.constructor.displayName}".
        Please file an issue`
      )
      // TODO consider using versions with getFragment
      this.componentHasMounted = false

      this.subscription = model.$.
        mergeMap(version => {
          const pathsAsArrayOrObject = fragments()
          let paths
          if (isPlainObject(pathsAsArrayOrObject)) {
            paths = toPaths(pathsAsArrayOrObject)
          }
          if (isArray(pathsAsArrayOrObject)) {
            paths = pathsAsArrayOrObject
          }
          invariant(paths, `fragments of ${this.constructor.displayName}
            should return paths in form of falcor pathArray syntax or use
            ez's object notation`
          )
          return Observable.fromPromise(
            model.get(...toPaths(fragments()))
          )
        }).
        subscribe(data => {
          if (!data) {
            return
          }
          if (!this.componentHasMounted) {
            this.state = data.json
            return
          }
          this.setState(data.json)
        })

      // run interactions
      this.intents = interactions(model, intents)
    }
    componentDidMount() {
      this.componentHasMounted = true
    }
    componentWillUnmount() {
      // Clean-up subscription before un-mounting
      this.subscription.unsubscribe()
    }
    render() {
      return createElement(WrappedComponent, { ...this.state, ...this.intents })
    }
  }

  return hoistStatics(Container, WrappedComponent)
}
