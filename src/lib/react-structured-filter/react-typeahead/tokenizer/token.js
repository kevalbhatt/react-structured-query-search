import React, { Component, Fragment } from "react";
import propTypes from "prop-types";

/**
 * Encapsulates the rendering of an option that has been "selected" in a
 * TypeaheadTokenizer
 */
export default class Token extends Component {
  static propTypes = {
    children: propTypes.object,
    onRemoveToken: propTypes.func
  };

  _makeCloseButton() {
    if (!this.props.onRemoveToken || this.props.ediTableTokenId !== null) {
      return "";
    }
    return (
      <a
        className="typeahead-token-close"
        href="javascript:void(0)"
        onClick={function(event) {
          this.props.onRemoveToken(this.props.children);
          event.preventDefault();
        }.bind(this)}
      >
        &#x00d7;
      </a>
    );
  }

  _makeEditButton() {
    if (!this.props.onRemoveToken) {
      return "";
    }
    return (
      <a
        className="typeahead-token-edit"
        href="javascript:void(0)"
        onClick={function(event) {
          event.stopPropagation();
          event.preventDefault();
          this.props.onEditToken(this.props.children);
        }.bind(this)}
      >
        &#x1F589;
      </a>
    );
  }

  getTokenValue() {
    let value = this.props.children["value"];
    if (value && typeof value == "object") {
      return value[this.props.fuzzySearchKeyAttribute];
    } else {
      return value.trim();
    }
  }

  getTokenItem() {
    if (this.props.renderTokenItem) {
      return this.props.renderTokenItem(this.props);
    } else {
      let val = this.props.children,
        tokenVal = (val.conditional && val.conditional.includes(')')) ? this.getTokenValue() : `"${this.getTokenValue()}"`,
        type = this.props.customQuery ? 'query' : this.props.options.find((o) => o.category === val.category).type,
        addColen = (type !== 'query' && (val.operator === undefined || val.operator === null)) ? ':' : '';
      return <Fragment>
        <span className="token-text" onClick={function(event) {
          event.stopPropagation();
          event.preventDefault();
          this.props.onEditToken(this.props.children);
        }.bind(this)}>
          <span className="token-conditional">{val.conditional == undefined ? "" : val.conditional}</span>
          <span className="token-category">{val["category"]}{addColen}</span>
          <span className="token-operator">{val.operator == undefined ? "" : val.operator}</span>
          <span className="token-value">{tokenVal}</span>
        </span>
      </Fragment>;
    }
  }

  render() {
    return (
      <div className="typeahead-token">
        {this.getTokenItem()}
        {this._makeCloseButton()}
      </div>
    );
  }
}
