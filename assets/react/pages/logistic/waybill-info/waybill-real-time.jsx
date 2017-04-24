/**
 * 运单实时状态
 * @author: 魏华东
 * @date: 2016.12.16
 */

import React from 'react';
import BtnGroup from '../../../../components/btn-group/btn_group.jsx';
import Table from '../../../../components/table.jsx';

class WaybillRealTime extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            currentStatus: '-1',                    // 当前司机运送状态
            waybillStatus:0,
            waybillList: [],
            detailInfo: [],
            detail: null
        };
        this.getRealTimeList = this.getRealTimeList.bind(this);
    }

    componentWillMount() {
        this.getRealTimeList();
    }

    // 获取实时运单列表
    getRealTimeList() {
        let todayStatus;
        this.state.currentStatus=='-1'?todayStatus=null:todayStatus=this.state.currentStatus;

        H.server.get_real_time_waybill({status: todayStatus}, (res)=>{
            if(res.code == 0) {
                this.setState({
                    detailInfo: res.data.driver
                });
            }else if(res.code == 10106) {
                H.overdue();
            }else{
                H.Modal(res.message);
            }
        });
    }

    // 创建卡片
    createCard() {
        let detailInfo = this.state.detailInfo,
            panel = [];

        if(detailInfo.length>0){
            detailInfo.map((detail, index)=>{

                let today = ['未发车', '配送中', '配送完成'],
                    todayStatus = today[detail.today_status/10];

                if(this.state.currentStatus == detail.today_status || this.state.currentStatus == '-1'){
                    panel.push(
                        <div key={index} className="col-lg-3">
                            <div className="thumbnail" data-index={index} data-uid={detail.uid}>
                                <div className="caption">
                                    <div className="row">
                                        <p className="col-lg-7">{detail.car_no}</p>
                                        <p className="col-lg-5">{detail.capacity}</p>
                                    </div>
                                    <div className="row">
                                        <p className="col-lg-7">{detail.name + '['+detail.mobile+']'}</p>
                                        <p className="col-lg-5">状态：{todayStatus}</p>
                                    </div>
                                    <hr/>
                                    {detail.statics[0]?
                                        <div className="row">
                                            <span className="col-lg-3">待揽货</span>
                                            <span className="col-lg-4">{detail.statics[0].customs}户，{detail.statics[0].volume}件</span>
                                            <a href="javascript:;" className="col-lg-4" onClick={this.openDetailPanel.bind(this)}>待揽货名单</a>
                                        </div>
                                        :null}
                                    {detail.statics[10]?
                                        <div className="row">
                                            <span className="col-lg-3">待装车</span>
                                            <span className="col-lg-4">{detail.statics[10].customs}户，{detail.statics[10].volume}件</span>
                                            <a href="javascript:;" className="col-lg-4" onClick={this.openDetailPanel.bind(this)}>待装车名单</a>
                                        </div>
                                    :null}
                                    {detail.statics[20]?
                                        <div className="row">
                                            <span className="col-lg-3">已装车</span>
                                            <span className="col-lg-4">{detail.statics[20].customs}户，{detail.statics[20].volume}件</span>
                                            <a href="javascript:;" className="col-lg-4" onClick={this.openDetailPanel.bind(this)}>已装车名单</a>
                                        </div>
                                    :null}
                                    {detail.statics[30]?
                                        <div className="row">
                                            <span className="col-lg-3">配送中</span>
                                            <span className="col-lg-4">{detail.statics[30].customs}户，{detail.statics[30].volume}件</span>
                                            <a href="javascript:;" className="col-lg-4" onClick={this.openDetailPanel.bind(this)}>配送中名单</a>
                                        </div>
                                        :null}
                                    {detail.statics[40]?
                                        <div className="row">
                                            <span className="col-lg-3">已送达</span>
                                            <span className="col-lg-4">{detail.statics[40].customs}户，{detail.statics[40].volume}件</span>
                                            <a href="javascript:;" className="col-lg-4" onClick={this.openDetailPanel.bind(this)}>已送达名单</a>
                                        </div>
                                    :null}
                                    {detail.statics[41]?
                                        <div className="row">
                                            <span className="col-lg-3">被拒单</span>
                                            <span className="col-lg-4">{detail.statics[41].customs}户，{detail.statics[41].volume}件</span>
                                            <a href="javascript:;" className="col-lg-4" onClick={this.openDetailPanel.bind(this)}>被拒单名单</a>
                                        </div>
                                    :null}
                                    <hr/>
                                </div>
                            </div>
                        </div>
                    );
                }
            });
        }


        return (
            <div className="row">
                {panel}
            </div>
        );
    }

    // 创建发车状态选择
    createStatus() {
        let statusNames = ['全部', '未发车', '配送中', '已结束'],
            statusData = ['-1', 0, 10, 20];

        return (
            <BtnGroup btnNames={statusNames} bindData={statusData} clickCallback={this.toggleStatus.bind(this)}
                      style="btn btn-lg" activeStyle="btn btn-lg btn-default" status={this.state.currentStatus}/>
        );
    }

    // 发车状态的切换
    toggleStatus(e) {
        let index = e.target.dataset.index;

        if(index === this.state.currentStatus) return;

        this.setState({
            currentStatus: index
        });
    }

    // 运单状态的切换
    toggleWaybillStatus(e) {
        let index = e.target.dataset.index;

        if(index === this.state.waybillStatus) {
            return;
        }

        this.setState({
            waybillStatus: index
        });
    }

    // 创建右侧的详细信息的栏目
    createDetail() {
        let btnNames = ['待揽货', '待装车', '已装车', '配送中', '已送达', '被拒单'],
            bindData = [0, 10, 20, 30, 40, 41],
            detail = this.state.detail;

        if(!detail){
            return null;
        }

        let today = ['未发车', '配送中', '配送完成'],
            todayStatus = today[detail.today_status/10];

        return (
            <div id="detail" className="detail">
                <div className="btn-slide" onClick={this.closeDetail.bind(this)}>收起</div>
                <div className="detail-content">
                    <div className="row">
                        <div className="col-lg-6">{detail.car_no + ' ' + detail.capacity}</div>
                        <div className="col-lg-4 pull-right">状态：{todayStatus}</div>
                    </div>
                    <div className="row">
                        <p className="col-lg-12">{detail.name} [{detail.mobile}]</p>
                    </div>
                    <div className="row" style={{marginBottom: '30px'}}>
                        <BtnGroup btnNames={btnNames} bindData={bindData} clickCallback={this.toggleWaybillStatus.bind(this)}
                                  style="btn btn-xs" activeStyle="btn btn-xs btn-default" status={this.state.waybillStatus}/>
                    </div>
                    {this.createTable()}
                </div>
            </div>
        );
    }

    // 关闭右侧的详细栏
    closeDetail() {
        $('#detail').removeClass('active');
    }

    // 打开右侧的详细栏
    openDetailPanel(e) {
        let html = $(e.target).html(),
            waybillStatus = this.state.waybillStatus,
            uid = e.target.parentNode.parentNode.parentNode.dataset.uid,
            waybill = {'待揽货名单':0, '待装车名单':10, '已装车名单':20, '配送中名单':30, '已送达名单':40, '被拒单名单':41};

        for(let key in waybill){
            if(key == html){
                waybillStatus = waybill[key];
            }
        }

        H.server.get_real_time_detail({id: uid}, (res)=>{
            if(res.code == 0) {

                this.setState({
                    waybillStatus: waybillStatus,
                    detail: res.data
                }, ()=>{
                    $('#detail').addClass('active');
                });
            } else if (res.code == 10106) {
                H.overdue();
            } else {
                H.Modal(res.message);
            }
        });
    }

    // 创建表格
    createTable() {
        let headlines = ['运单号', '提货码', '件量', '发货方'],
            order = ['day_no', 'codes', 'volume', 'sender'],
            fn = {},
            status = {},
            statusOperate = {};
        let delivers = [];

        this.state.detail.deliveries.map((delivery)=>{
            delivery.codes = H.getLadingCode(delivery.code, [2, 3, 4]);
            delivery.sender = delivery.shop.name;

            if(this.state.waybillStatus == delivery.status){
                delivers.push(delivery);
            }

        });

        return (
            <Table values={delivers} headlines={headlines} order={order} bodyOperate={fn} id={'InTimeInfo'}
                   statusOperate={statusOperate} status={status} />
        );
    }

    // 刷新页面
    refresh() {
        this.setState({
            currentStatus: '-1'
        }, this.getRealTimeList);
    }

    render() {
        return (
            <div className="section-warp">
                <div className="section-table">
                    <div className="section-filter">
                        <form className="form-inline">
                            <div className="filter-row">
                                {this.createStatus()}
                                <a href="javascript:;" className="form-control-static" style={{marginLeft: '50px'}} onClick={this.refresh.bind(this)}>刷新</a>
                            </div>
                        </form>
                    </div>
                    <div className="col-lg-12">
                        {this.createCard()}
                        {this.createDetail()}
                    </div>
                </div>
            </div>
        );
    }
}

export default WaybillRealTime;