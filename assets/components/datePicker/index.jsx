import React , { Component } from 'react';
//import "./jquery-ui.less";
import Btn from "../btn/btn.js";

class datePicker extends React.Component {

	constructor(props) {
		super(props);
	}

    componentDidMount(){
    	$.datepicker.regional[ "zh-CN" ] = {
				closeText: "关闭",
				prevText: "&#x3C;上月",
				nextText: "下月&#x3E;",
				currentText: "今天",
				monthNames: [ "一月","二月","三月","四月","五月","六月",
				"七月","八月","九月","十月","十一月","十二月" ],
				monthNamesShort: [ "一月","二月","三月","四月","五月","六月",
				"七月","八月","九月","十月","十一月","十二月" ],
				dayNames: [ "星期日","星期一","星期二","星期三","星期四","星期五","星期六" ],
				dayNamesShort: [ "周日","周一","周二","周三","周四","周五","周六" ],
				dayNamesMin: [ "日","一","二","三","四","五","六" ],
				weekHeader: "周",
				dateFormat: "yy-mm-dd",
				firstDay: 1,
				isRTL: false,
				showMonthAfterYear: true,
				yearSuffix: "年" 
		};
	let _this = this;
	let startTimeId = (this.props.prefix ? this.props.prefix : "") + "startTime",
	    endTimeId = (this.props.prefix ? this.props.prefix : "") + "endTime";
	let $dateInputF = $('#'+startTimeId),
	    $dateInputT = $('#'+endTimeId);
	    $.datepicker.setDefaults( $.datepicker.regional[ "zh-CN" ] );
	    
	    $dateInputF.datepicker({
			dateFormat: 'yy-mm-dd',
			changeMonth: true,
			changeYear: true,
			onClose: function(selectDate){
				$dateInputT.datepicker( "option", "minDate", selectDate );
				_this.props.changeCallback && _this.props.changeCallback();
			}
	    });
		
	    $dateInputT.datepicker({
			dateFormat: 'yy-mm-dd',
			changeMonth: true,
			changeYear: true,
			onClose: function(selectDate){
				$dateInputF.datepicker( "option", "maxDate", selectDate );
                _this.props.changeCallback && _this.props.changeCallback();
			}
	    });

	    $dateInputT.val(this.props.end);
	    $dateInputF.val(this.props.start);

    }

    searchHandler(e){
    	e.preventDefault();
    	this.props.searchEvt();
    }

    render(){
    	return(
    		<div className="time-search-w">
				<input type="text" className={"form-control "+this.props.otherClass} id={(this.props.prefix ? this.props.prefix : "") + "startTime"}
					   placeholder="起始日期"/>
				一 &nbsp;
				<input type="text" className={"form-control "+this.props.otherClass} id={(this.props.prefix?this.props.prefix:"") + "endTime"}
					   placeholder="结束日期" />
				{this.props.btn?<Btn name={this.props.btn} otherClass="btn-xs btn-orange" btnEvent={this.searchHandler.bind(this)}/>:''}
			</div>
    	);
    }
}

export default datePicker;
