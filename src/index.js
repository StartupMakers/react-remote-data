import React, { Component, PropTypes } from 'react'

function addSaltToURL(URL) {
  const salt = Math.floor((Date.now() + Math.random()) * 100)
  if (URL.indexOf('?') >= 0) {
    return URL + '&_=' + salt
  } 
  return URL + '?_=' + salt
}

function getRouteWithSalt(CallbackOrURL) {
  if (typeof CallbackOrURL === 'function') {
    return function (...args) {
      const targetURL = CallbackOrURL(...args)
      return addSaltToURL(targetURL)
    }
  }
  return addSaltToURL(CallbackOrURL)
}

export default class RemoteData extends Component {

  static propTypes = {
    src: PropTypes.string,
    options: PropTypes.object,
    forceFetch: PropTypes.bool,
    renderLoading: PropTypes.func,
    renderFetched: PropTypes.func,
    renderFailure: PropTypes.func,
    onLoad: PropTypes.func,
    onError: PropTypes.func,
  }

  constructor(props, context) {
    super(props, context)
    this._handleRetry = this.fetchData.bind(this)
    const route =
      props.forceFetch ?
        getRouteWithSalt(props.route) :
        props.route
    this.state = {
      ...props,
      route,
      isLoading: true,
      isFailed: false,
      request: null,
    }
  }

  componentDidMount() {
    this.fetchData()
  }

  componentWillReceiveProps(nextProps) {
    const { route, forceFetch } = this.props
    const nextState = {}
    const rawRoute =
      (nextProps.route !== route) ?
        nextProps.route :
        route
    const hasSalt = 
      (nextProps.forceFetch !== forceFetch) ?
        nextProps.forceFetch :
        forceFetch
    const finalRoute =
      hasSalt ?
        getRouteWithSalt(rawRoute) :
        rawRoute
    if (finalRoute !== this.state.route) {
      this.setState({
        route: finalRoute,
        isLoading: true,
        isFailed: false,
      }, () => this.fetchData())
    }
  }

  fetchData() {
    const { onLoad, onError } = this.props
    const { route } = this.state
    const { options } = this.options
    const finalOptions = options || {}
    const finalURL =
      (typeof route === 'function') ?
        route() :
        route
    const request =
      fetch(finalURL, finalOptions)
        .then(response => response.json())
        .then(data => {
          this.setState({
            data,
            isLoading: false,
            isFailed: false,
            lastError: null,
          }, () => {
            if (onLoad) {
              onLoad(data, finalURL)
            }
          })
        })
        .catch(err => {
          this.setState({
            data: null,
            isLoading: false,
            isFailed: true,
            lastError: err,
          }, () => {
            if (onError) {
              onError(err, finalURL)
            }
          })
        })
    this.setState({
      request,
    })
  }

  render() {
    const { isLoading, isFailed, route, request, data, lastError } = this.state
    const { renderLoading, renderFetched, renderFailure } = this.props
    if (isLoading) { 
      if (renderLoading) {
        return renderLoading(data, request)
      }
    } else if (isFailed) {
      if (renderFailure) {
        return renderFailure(lastError, this._handleRetry, request)
      }
    } else if (renderFetched) {
      return renderFetched({ route, data, request })
    }
    return props.children
  }
}
