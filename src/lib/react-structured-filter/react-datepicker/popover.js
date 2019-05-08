import React, { Component } from "react";
import Tether from "tether";

export default class Popover extends Component {
  displayName = "Popover";

  componentWillMount() {
    popoverContainer = document.createElement("span");
    popoverContainer.className = "datepicker__container";

    this._popoverElement = popoverContainer;

    document.querySelector("body").appendChild(this._popoverElement);
  }

  componentDidMount() {
    this._renderPopover();
  }

  componentDidUpdate() {
    this._renderPopover();
  }

  _popoverComponent() {
    var className = this.props.className;
    return <div className={className}>{this.props.children}</div>;
  }

  _tetherOptions() {
    return {
      element: this._popoverElement,
      target: this.current.parentElement,
      attachment: "top left",
      targetAttachment: "bottom left",
      targetOffset: "10px 0",
      optimizations: {
        moveElement: false // always moves to <body> anyway!
      },
      constraints: [
        {
          to: "window",
          attachment: "together",
          pin: true
        }
      ]
    };
  }

  _renderPopover() {
    React.render(this._popoverComponent(), this._popoverElement);

    if (this._tether != null) {
      this._tether.setOptions(this._tetherOptions());
    } else {
      this._tether = new Tether(this._tetherOptions());
    }
  }

  componentWillUnmount() {
    this._tether.destroy();
    React.unmountComponentAtNode(this._popoverElement);
    if (this._popoverElement.parentNode) {
      this._popoverElement.parentNode.removeChild(this._popoverElement);
    }
  }

  render() {
    return <span />;
  }
}