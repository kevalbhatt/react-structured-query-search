import React, { Component, Fragment } from "react";
import propTypes from "prop-types";
import TypeaheadOption from "./option";
import classNames from "classnames";

/**
 * Container for the options rendered as part of the autocompletion process
 * of the typeahead
 */
export default class TypeaheadSelector extends Component {
  static propTypes = {
    options: propTypes.array,
    header: propTypes.string,
    customClasses: propTypes.object,
    selectionIndex: propTypes.number,
    onOptionSelected: propTypes.func
  };

  static defaultProps = {
    selectionIndex: null,
    customClasses: {},
    onOptionSelected: function(option) {}
  };

  constructor(props) {
    super(props);
    this.state = {
      selectionIndex: this.props.selectionIndex,
      selection: this.getSelectionForIndex(this.props.selectionIndex)
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ selectionIndex: null });
  }

  setSelectionIndex(index) {
    this.setState({
      selectionIndex: index,
      selection: this.getSelectionForIndex(index)
    });
  }

  getSelectionForIndex(index) {
    if (index === null) {
      return null;
    }
    return this.props.options[index];
  }

  _onClick(result, event) {
    this.props.onOptionSelected(result);
  }

  _nav(delta) {
    if (!this.props.options) {
      return;
    }
    var newIndex;
    if (this.state.selectionIndex === null) {
      if (delta == 1) {
        newIndex = 0;
      } else {
        newIndex = delta;
      }
    } else {
      newIndex = this.state.selectionIndex + delta;
    }
    if (newIndex < 0) {
      newIndex += this.props.options.length;
    } else if (newIndex >= this.props.options.length) {
      newIndex -= this.props.options.length;
    }
    var newSelection = this.getSelectionForIndex(newIndex);
    this.setState({ selectionIndex: newIndex, selection: newSelection });
  }

  navDown = () => {
    this._nav(1);
  };

  navUp = () => {
    this._nav(-1);
  };

  // _scrollTo = () => {
  //   if (this.selectedItemRef) {
  //     let listParent = this.listParentRef.getBoundingClientRect(),
  //       selectedItem = this.selectedItemRef.getBoundingClientRect(),
  //       parentTop = listParent.top,
  //       selectedTop = selectedItem.top;
  //   }
  // };

  getSearchItem(item, grouping) {
    if (this.props.renderSearchItem) {
      this.props.renderSearchItem(item);
    } else {
      if (typeof item == "object") {
        let attr = this.props.fuzzySearchKeyAttribute;
        if (grouping && item.displayName) {
          return item.displayName;
        } else {
          return item[attr] || item["string"];
        }
        //return grouping && item.displayName ? item.displayName : item[attr] ? item[attr] : item["string"];
      } else if (typeof item == "string") {
        return item;
      }
    }
  }

  groupingOptions = () => {
    const opt = {};
    this.props.options.sort((a, b) => {
      let aL = a.group.toLocaleLowerCase(),
        bL = b.group.toLocaleLowerCase();
      if (aL === bL) {
        return 0;
      }
      return aL < bL ? -1 : 1;
    });
    return this.getOptionsItems(this.props.options, true);
  };

  getOptionsList = () => {
    let options = this.props.options;
    if (this.props.options && this.props.options.length && this.props.options[0].group) {
      return this.groupingOptions();
    } else {
      return this.getOptionsItems(options);
    }
  };

  getOptionsItems = (options, grouping = false) => {
    let groupText = {};
    return options.map(function(result, i) {
      let elementSelected = this.state.selectionIndex === i,
        disabledElement = result == this.props.fuzzySearchEmptyMessage,
        item = this.getSearchItem(result, grouping),
        Header = null;
      if (grouping && !groupText[result.group]) {
        groupText[result.group] = true;
        Header = (
          <li className="group-title">
            <strong>{result.group}</strong>
          </li>
        );
      }
      return (
        <Fragment key={`${item}-${i}`}>
          {Header}
          <TypeaheadOption
            isAllowOperator={this.props.isAllowOperator}
            disabled={disabledElement}
            hover={disabledElement ? false : elementSelected}
            customClasses={this.props.customClasses}
            onClick={this._onClick.bind(this, result)}
            grouping={grouping}
          >
            {item}
          </TypeaheadOption>
        </Fragment>
      );
    }, this);
  };

  render() {
    var classes = {
      "typeahead-selector": true
    };
    classes[this.props.customClasses.results] = this.props.customClasses.results;
    var classList = classNames(classes);
    this.selectedItemRef = null;
    var results = this.getOptionsList();
    return (
      <ul className={classList} ref={ref => (this.listParentRef = ref)}>
        {this.props.fromTokenizer === true && this.props.isAllowSearchDropDownHeader === true ? (
          <li className="header">{this.props.header}</li>
        ) : null}
        {results}
      </ul>
    );
  }
}