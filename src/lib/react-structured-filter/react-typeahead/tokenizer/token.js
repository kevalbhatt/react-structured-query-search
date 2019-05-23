import React, { Component } from "react";
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
    if (!this.props.onRemoveToken) {
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

  getTokenValue() {
    let value = this.props.children["value"];
    if (value && typeof value == "object") {
      return value[this.props.fuzzySearchKeyAttribute];
    } else {
      return value;
    }
  }

  getTokenItem() {
    if (this.props.renderTokenItem) {
      return this.props.renderTokenItem(this.props);
    } else {
      let val = this.props.children;
      return `${val["category"]} ${val.operator == undefined ? "" : val.operator} "${this.getTokenValue()}" `;
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