import React, { Component, PropTypes } from 'react'

function getURLWithSalt(URL) {
  if (typeof URL === 'string' && URL !=='' && URL.indexOf('data:') !== 0) {
    const salt = Math.floor((Date.now() + Math.random()) * 100)
    if (URL.indexOf('?') >= 0) {
      return URL + '&_=' + salt
    } 
    return URL + '?_=' + salt
  }
  return URL
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
    const src = props.forceFetch ? getURLWithSalt(props.src) : props.src
    this.state = {
      ...props,
      src,
      isLoading: true,
      isFailed: false,
      request: null,
    }
  }

  componentDidMount() {
    this.fetchData()
  }

  componentWillReceiveProps(nextProps) {
    const { src, forceFetch } = this.props
    const nextState = {}
    const rawSrc  =
      (nextProps.src !== src) ?
        nextProps.src :
        src
    const hasSalt = 
      (nextProps.forceFetch !== forceFetch) ?
        nextProps.forceFetch :
        forceFetch
    const finalSrc =
      hasSalt ?
        getURLWithSalt(rawSrc) :
        rawSrc
    if (finalSrc !== this.state.src) {
      this.setState({
        src: finalSrc,
        isLoading: true,
        isFailed: false,
      }, () => this.fetchData())
    }
  }

  fetchData() {
    const { onLoad, onError } = this.props
    const { src } = this.state
    const { options } = this.options
    const finalOptions = options || {}
    const request =
      fetch(src, finalOptions)
        .then(response => response.json())
        .then(data => {
          this.setState({
            data,
            isLoading: false,
            isFailed: false,
            lastError: null,
          }, () => {
            if (onLoad) {
              onLoad(data)
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
              onError(data)
            }
          })
        })
    this.setState({
      request,
    })
  }

  render() {
    const { isLoading, isFailed, src, request, data, lastError } = this.state
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
      return renderFetched({ src, data, request })
    }
    return props.children
  }
}
