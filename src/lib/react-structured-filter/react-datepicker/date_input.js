import React, { Component } from "react";
import propTypes from "prop-types";
import moment from "moment";

import DateUtil from "./util/date";

export default class DateInput extends Component {
  static propTypes = {
    onKeyDown: propTypes.func
  };

  constructor(props) {
    super(props);
    this.entryRef = null;
    this.state = {
      dateFormat: "YYYY-MM-DD"
    };
  }

  getInitialState() {
    return {
      value: this.safeDateFormat(this.props.date)
    };
  }

  componentDidMount() {
    this.toggleFocus(this.props.focus);
  }

  componentWillReceiveProps(newProps) {
    this.toggleFocus(newProps.focus);

    this.setState({
      value: this.safeDateFormat(newProps.date)
    });
  }

  toggleFocus(focus) {
    if (focus) {
      this.entryRef.focus();
    } else {
      this.entryRef.blur();
    }
  }

  handleChange = event => {
    var date = moment(event.target.value, this.props.dateFormat, true);

    this.setState({
      value: event.target.value
    });
  };

  safeDateFormat(date) {
    return !!date ? date.format(this.props.dateFormat) : null;
  }

  isValueAValidDate() {
    var date = moment(event.target.value, this.props.dateFormat, true);

    return date.isValid();
  }

  handleEnter(event) {
    if (this.isValueAValidDate()) {
      var date = moment(event.target.value, this.props.dateFormat, true);
      this.props.setSelected(new DateUtil(date));
    }
  }

  handleKeyDown = event => {
    switch (event.key) {
      case "Enter":
        event.preventDefault();
        this.handleEnter(event);
        break;
      case "Backspace":
        this.props.onKeyDown(event);
        break;
    }
  };

  handleClick = event => {
    this.props.handleClick(event);
  };

  render() {
    return (
      <input
        ref={ref => (this.entryRef = ref)}
        type="text"
        value={this.state.value}
        onClick={this.handleClick}
        onKeyDown={this.handleKeyDown}
        onFocus={this.props.onFocus}
        onChange={this.handleChange}
        className="datepicker__input"
        placeholder={this.props.placeholderText}
      />
    );
  }
}