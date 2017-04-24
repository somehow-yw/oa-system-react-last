/**
 * 运单管理（全部运单页）
 * @author: 魏华东
 * @date: 2016.12.14
 */

import React from 'react';
import Table from '../../../../components/table.jsx';
import BtnGroup from '../../../../components/btn-group/btn_group.jsx';
import Search from '../../../../components/search/search.js';
import Paging from '../../../../components/page/paging.js';
import DatePicker from '../../../../components/datePicker/index.jsx';
import WaybillDetail from './waybill-detail.jsx';
import Dispatching from './dispatching.jsx';
import AddWaybill from './add-waybill.jsx';

class WaybillInfo extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            areaList:[],                        // 区域的数组信息
            waybillList:[],                     // 全部运单信息

            search:'',                          // 搜索词
            searchType:[],                      // 搜索类型
            start:H.getSouroundDate(0),         // 查询的起始时间
            end:H.getSouroundDate(0),           // 查询的结束时间
            status:[],                          // 运单状态
            adcode:'',                          // 区域编号
            amount:'',                          // 是否代收款
            date:'',

            currentDate:0,          // 当前选中的预设日期
            currentBillStatus:'-1', // 当前选中的运单状态

            area:'成都市',           // 配送区域
            currentArea:0,          // 当前选中的区域
            replace:0,              // 是否代收货款
            currentReplace:0,       // 当前代收货款状态

            page:1,                             // 当前页数
            size:30,                            // 每一页显示多少条纪录
            total:50,                           // 运单总数
            shopTotal:0,                        // 发货人数量
            customTotal:0,                      // 提货人数量
            panel:''                            // 明细的页面
        };

        this.getData = this.getData.bind(this);
        this.operate = this.operate.bind(this);
        this.srOnlyLadingNumber = this.srOnlyLadingNumber.bind(this);
        this.srOnlySender = this.srOnlySender.bind(this);
        this.closePanel= this.closePanel.bind(this);
        this.getAllArea= this.getAllArea.bind(this);
        this.urlEncode= this.urlEncode.bind(this);
    }

    // 初始化获取数据
    componentWillMount() {
        new Promise((resolve)=>{
            this.getAllArea(resolve);
        }).then(()=>{
            this.getData();
        });
    }

    //获取所有大区;
    getAllArea(resolve) {
        H.server.get_all_area({id: 510100}, (res) => {
            if(res.code == 0){
                this.setState({
                    areaList:res.data.children
                }, ()=>{resolve(res);});
            }else if(res.code == 10106) {
                H.overdue();
            }else{
                H.Modal(res.message);
            }
        });
    }

    // 获取全部数据
    getData(){
        let waybillData = {};
        waybillData.start = this.state.start;
        waybillData.end = this.state.end;
        waybillData.status = this.state.status;
        waybillData.page = this.state.page;
        waybillData.size = this.state.size;

        if(this.state.search){
            waybillData.search = this.state.search;
            waybillData.search_type=this.state.searchType;
        }
        if(this.state.amount===false||this.state.amount===true){
            waybillData.amout = this.state.amount;
        }
        if(this.state.adcode){
            waybillData.adcode = this.state.adcode;
        }

        H.server.get_all_waybill(waybillData, (res) => {
            if(res.code == 0) {
                this.setState({
                    total: res.data.total,
                    shopTotal: res.data.shop_num,
                    customTotal: res.data.custom_num,
                    waybillList: res.data.deliveries
                });
            }else if(res.code == 10106) {
                H.overdue();
            }else{
                H.Modal(res.message);
            }
        });
    }

    // 创建选择区域
    createSelectArea() {
        let date = ['今天', '明天'],
            dateData = [0, 1];
        let billStatus = ['全部', '待揽货', '待装车', '已装车', '配送中', '已送达', '已拒单', '已取消'],
            billStatusData = ['-1', 0, 10, 20, 30, 40, 41, '-10'];
        let area = [],
            areaData = [];
        let replace = ['全部', '否', '是'],
            replaceData = [0, 1, 2];

        area.push('全部');
        areaData.push(0);
        this.state.areaList.map((areaInfo, index) => {
            area.push(areaInfo.name);
            areaData.push(index+1);
        });

        return (
            <div className="section-filter" style={{paddingTop: 0}}>
                <form className="form-inline">
                    <div className="filter-row">
                        {this.createSearchBar()}
                    </div>
                </form>
                <div className="row">
                    <form className="form-inline col-lg-12">
                        <div className="filter-row">
                            <label style={{display: 'inline-block', width: '6em'}}>配送日期</label>
                            <BtnGroup btnNames={date} bindData={dateData} clickCallback={this.toggleDate.bind(this)}
                                      style="btn btn-xs" activeStyle="btn btn-xs btn-default" status={this.state.currentDate}/>
                            <label style={{display: 'inline-block', width: '4em', marginLeft: '50px'}}>日期</label>
                            <DatePicker start={this.state.start} end={this.state.end} prefix="waybill_date_" otherClass="input-sm" changeCallback={this.dateRange.bind(this)}/>

                        </div>
                    </form>
                    <form className="form-inline col-lg-12">
                        <div className="filter-row">
                            <label style={{display: 'inline-block', width: '6em'}}>运单状态</label>
                            <BtnGroup btnNames={billStatus} bindData={billStatusData} clickCallback={this.toggleBillStatus.bind(this)}
                                      style="btn btn-xs" activeStyle="btn btn-xs btn-default" status={this.state.currentBillStatus}/>
                        </div>
                    </form>

                    <form className="form-inline col-lg-12">
                        <div className="filter-row">
                            <label style={{display: 'inline-block', width: '6em'}}>区县</label>
                            <BtnGroup btnNames={area} bindData={areaData} clickCallback={this.toggleArea.bind(this)}
                                      style="btn btn-xs" activeStyle="btn btn-xs btn-default" status={this.state.currentArea}/>
                        </div>
                    </form>
                    <form className="form-inline col-lg-12">
                        <div className="filter-row">
                            <label style={{display: 'inline-block', width: '6em'}}>代收货款</label>
                            <BtnGroup btnNames={replace} bindData={replaceData} clickCallback={this.toggleReplace.bind(this)}
                                      style="btn btn-xs" activeStyle="btn btn-xs btn-default" status={this.state.currentReplace}/>
                        </div>
                    </form>
                    <div className="form-inline col-lg-6">
                        <label style={{display: 'inline-block', width: '6em'}}></label>
                        <a className="btn btn-lg btn-orange" onClick={this.select.bind(this)}>筛选</a>
                    </div>
                </div>
            </div>
        );
    }

    // 开始筛选
    select(){
        if($('#component_search_input').val()==''){
            this.setState({
                search: '',
                searchType: []
            });
        }
        this.setState({
            page: 1
        }, this.getData);
    }

    // 创建搜索框
    createSearchBar() {
        return (
            <div className="search-bar">
                <Search dropdownMenus={['全部', '运单号', '提货人手机号', '提货码', '提货人', '发货人']} emit={this.search.bind(this)}
                        onChange={this.changeSelect.bind(this)}/>
            </div>
        );
    }

    // 改变搜索下拉框的选项
    changeSelect(val) {
        let searchType = [],
            search = ['all', 'no', 'mobile', 'code', 'custom', 'shop'];

        if(search[val]=='all'){
            searchType = ['no', 'mobile', 'code', 'custom', 'shop'];
        }else {
            searchType.push(search[val]);
        }

        this.setState({
            searchType: searchType
        });
    }

    // 搜索按钮
    search() {
        let searchContent = $('#component_search_input').val();

        this.setState({
            search: searchContent,
            page: 1
        }, this.getData);

    }

    // 切换预设日期的选择
    toggleDate(e) {
        let index = e.target.dataset.index,
            date = null;

        if(index === this.state.currentDate){
            return;
        }

        switch (e.target.innerHTML) {
            case '今天':
                date = H.getSouroundDate(0);
                $('#waybill_date_startTime').val(date);
                $('#waybill_date_endTime').val(date);
                break;
            case '明天':
                date = H.getSouroundDate(-1);
                $('#waybill_date_startTime').val(date);
                $('#waybill_date_endTime').val(date);
                break;
        }

        this.setState({
            page: 1,
            currentDate: index,
            start:date,
            end:date
        });
    }

    // 切换日期范围
    dateRange() {
        let startDate = $('#waybill_date_startTime').val(),
            endDate = $('#waybill_date_endTime').val();

        this.setState({
            currentDate: 3,
            start: startDate,
            end: endDate
        });
    }

    // 切换代收货款的选项
    toggleReplace(e) {
        let index = e.target.dataset.index,
            amount = null;

        //如果点击的区域index和当前区域index相当，则跳出方法
        if(index === this.state.currentReplace) {
            return;
        }

        if(index == 1){
            amount = Boolean(false);
        } else if (index == 2){
            amount = Boolean(true);
        } else {
            amount = '';
        }

        this.setState({
            page: 1,
            currentReplace: index,
            amount: amount
        });
    }

    // 切换所选区县
    toggleArea(e) {
        let index = e.target.dataset.index,
            adcode = this.state.adcode;

        if(this.state.areaList[index-1]){
            adcode = this.state.areaList[index-1].id;
        }else {
            adcode = '';
        }

        if(index == this.state.currentArea) {
            return;
        }

        this.setState({
            page: 1,
            currentArea: index,
            adcode: adcode
        });
    }

    // 切换运单状态
    toggleBillStatus(e) {
        let index = e.target.dataset.index,
            status = [];

        if(index === this.state.currentBillStatus) {
            return;
        }

        if(index == '-1'){
            status = [];
        } else {
            status.push(index);
        }

        this.setState({
            page: 1,
            currentBillStatus: index,
            status: status
        });
    }

    // 创建表格
    createTable() {
        let headlines = ['运单号', '提货码', '提货人', '件数', '发货方', '状态', '来源', '配送日期', '代收货款', '操作'],
            order = ['day_no', 'lading_code', 'fetch', 'volume', 'sender', 'status', 'source', 'day', 'amount', 'operate'],
            status = {
                5: {
                    0: '待揽货',
                    10: '待装车',
                    20: '已装车',
                    30: '配送中',
                    40: '已送达',
                    41: '已拒单',
                    '-10': '已取消',
                    '-11': '已取消（发货人）',
                    '-12': '已取消（后台）',
                    '-13': '已取消（司机发货）'
                }
            },
            statusOperate = {},
            fn= {
                1: this.srOnlyLadingNumber,
                4: this.srOnlySender,
                9: this.operate
            };

        let waybillList = this.state.waybillList;
        waybillList.map((waybill, index) => {
            waybill.operate = index;
            waybill.fetch = waybill.custom.name+' ['+waybill.custom.mobile+']';
            waybill.lading_code = H.getLadingCode(waybill.code, [2, 3, 4]);
            waybill.sender = waybill.shop.name;

            if(waybill.status == '-10' || waybill.status == '-11' || waybill.status == '-12' || waybill.status == '-13'){
                waybill.operate = '';
            } else {
                statusOperate[index] = ['作废', '明细'];
            }
        });

        return (
            <Table values={this.state.waybillList} headlines={headlines} order={order} bodyOperate={fn} id={'waybillInfo'}
                   statusOperate={statusOperate} status={status} cellStyle={{0:{condition:['location_confirmed', false], style: {color: 'red'}}}} />
        );
    }

    // 表格的相关操作
    operate(e) {
        let oper = $(e.target).html(),
            id = e.target.dataset.reactid.split('$')[2].split('.')[0],
            waybillId = this.state.waybillList[id].id;

        switch (oper){
            case '作废':
                H.Modal({
                    content:'确认作废该条运单？',
                    okText:'确认作废',
                    cancel:true,
                    okCallback: () => {
                        H.server.cancel_waybill({
                            id: waybillId
                        }, (res) => {
                            if(res.code == 0){
                                H.Modal('运单已作废！');
                                this.getData();
                            } else if(res.code == 10106) {
                                H.overdue();
                            } else {
                                H.Modal(res.message);
                            }
                        });
                    }
                });
                break;
            case '明细':
                this.setState({
                    panel:<WaybillDetail closePanel={this.closePanel} waybillId={waybillId}/>
                });
                break;
        }
    }

    // 只看提货码
    srOnlyLadingNumber(e) {
        let searchType = ['code'],
            search = $(e.target).html();

        this.setState({
            searchType: searchType,
            search: search
        }, this.getData);
    }

    // 只看发货方
    srOnlySender(e) {

        let searchType = ['shop'],
            search = $(e.target).html();

        this.setState({
            searchType: searchType,
            page: 1,
            search: search
        }, this.getData);
    }

    // 设置分页页码
    setPageNum(page) {
        this.setState({
            page: page.page
        }, this.getData);
    }

    // 关闭panel
    closePanel() {
        this.setState({
            panel: ''
        });
    }

    // 调度分配
    dispatching() {
        this.setState({
            panel:<Dispatching closePanel={this.closePanel}/>
        });
    }

    // 录单
    addFreight() {
        this.setState({
            panel:<AddWaybill closePanel={this.closePanel}/>
        });
    }

    // 刷新
    refresh(){
        this.setState({
            search:'',
            searchType:[],
            start:H.getSouroundDate(0),
            end:H.getSouroundDate(0),
            status:[],
            amount:'',
            currentDate:0,          // 当前选中的预设日期
            currentBillStatus:'-1', // 当前选中的运单状态
            currentArea:0,          // 当前选中的区域
            currentReplace:0,       // 当前代收货款状态
            page:1                             // 当前页数
        }, this.getData);
    }

    //导入运单;
    importWaybill() {
        $('#importWaybill')[0].click();
    }

    urlEncode(param, key, encode) {
        if(param==null) return '';
        var paramStr = '';
        var t = typeof (param);
        if (t == 'string' || t == 'number' || t == 'boolean') {
            paramStr += '&' + key + '=' + ((encode==null||encode) ? encodeURIComponent(param) : param);
        } else {
            for (var i in param) {
                var k = key == null ? i : key + (param instanceof Array ? '[' + i + ']' : '.' + i);
                paramStr += this.urlEncode(param[i], k, encode);
            }
        }
        return paramStr;
    };

    //导出运单;
    exportWaybill() {
            let data = this.state;
        let waybillData = {};
        waybillData.search = data.search;
        waybillData.search_type = data.searchType;
        waybillData.start = data.start;
        waybillData.end = data.end;
        waybillData.status = data.status;
        waybillData.adcode = data.adcode;
        waybillData.amount = data.amount;
        window.open('/logistics/delivery/export?'+this.urlEncode(waybillData));
    }

    importWaybillChange() {
        $.ajax({
            url: '/logistics/delivery/import',
            type: 'POST',
            data: new FormData($('#importWaySubmit')[0]),
            async: false,
            cache: false,
            contentType: false,
            processData: false,
            success: (res) => {
                $('#importWaybill').val('');
                window.open(res);
                this.refresh();
            },
            error: () => {
                $('#importWaybill').val('');
            }
        });
    }

    render() {
        return (
            <div className="section-warp container-fluid">
                <div className="section-table row">
                    <div className="section-filter">
                        {this.createSelectArea()}
                        <div className="filter-row pull-right">
                            <a href="javascript:;" className="btn btn-lg btn-default" onClick={this.exportWaybill.bind(this)}>导出</a>
                            <a href="javascript:;" className="btn btn-lg btn-default" onClick={this.importWaybill.bind(this)}>导入</a>
                            <a href="javascript:;" className="btn btn-lg btn-default" onClick={this.addFreight.bind(this)}>录单</a>
                            <a href="javascript:;" className="btn btn-lg btn-default" onClick={this.dispatching.bind(this)}>调度分配</a>
                            <form id="importWaySubmit" style={{width: '0', height: '0', overflow: 'hidden'}}>
                                <input id="importWaybill" onChange={this.importWaybillChange.bind(this)} name="file" type="file" />
                            </form>
                        </div>
                    </div>
                    <div className="col-lg-12">
                        <div className="row">
                            <div className="row">
                                <p className="col-lg-6 pull-left">当前结果：{this.state.total}个运单，共{this.state.customTotal}个提货人，共{this.state.shopTotal}个发货人</p>
                                <a href="javascript:;" className="col-lg-6 text-right" onClick={this.refresh.bind(this)}>刷新</a>
                            </div>
                            {this.createTable()}
                            <Paging key={this.state.count} maxPage={Math.ceil(this.state.total/this.state.size)} clickCallback={this.setPageNum.bind(this)}/>
                        </div>
                    </div>
                </div>
                {this.state.panel}
            </div>
        );
    }
}

export default WaybillInfo;