import React, {Component, Fragment} from 'react';

import ReactStructuredQuerySearch from "react-structured-query-search";

export default class CustomQueryTokenizer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selected : []
        };
        this.options = this.props.queryOptions || [];
    }

    getOperatorOptions () {
        return ["==", "!="];
    }

    getSymbolOptions () {
        return ["TFSC", "PIL", "VNET"];
    }

    getTokenItem (obj) {
        const val = obj.children;
        return `${val.conditional} ${val.category} ${val.operator} ${val.value}`;
    }

    trimText (val) {
        return val.trim() === "" ? val.trim() : val + " ";
    }

    updateParentInputText () {
        let str = '';
        this.state.selected.forEach((s) => {
            str += this.trimText(s.conditional);
            str += this.trimText(s.category);
            str += this.trimText(s.operator);
            str += this.trimText(s.value);
        });
        this.props.updatedInputText(str);
    }

    render() {
        return(
            <Fragment>
                <ReactStructuredQuerySearch
					isAllowOperator={true}
					defaultSelected={this.state.selected}
					options={this.options}
					renderTokenItem={this.getTokenItem}
                    conditionalHeader={"Conditional"}
                    categoryHeader={'Selection'}
					onTokenAdd={val => console.log(val, 'onTokenAdd')}
					customClasses={{
						input: "filter-tokenizer-text-input",
						results: "filter-tokenizer-list__container",
                        listItem: "filter-tokenizer-list__item",
                        query: "custom-query"
                    }}
                    emptyParentCategoryState={this.props.emptyParentCategoryState}
                    updateParentInputText={this.updateParentInputText.bind(this)}
                    customQuery={true}
                    autoFocus={true}
                />
            </Fragment>
        );
    }
};
