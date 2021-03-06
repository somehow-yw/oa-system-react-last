
import React from 'react';

class AddPopUpAd extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            areaList: [],
            adImgPath:'',
            currentArea:2
        };
    }

    componentWillMount(){
        if($('#mybase64').length <= 0){
            let scriptStr = '<script id="mybase64" src="/js/mybase64.js"></script>';
            $('body').append(scriptStr);
        }

        H.server.get_area_list({}, (res)=>{
            if(res.code == 0){
                this.setState({
                    areaList: res.data
                });
            }else if(res.code == 10106) {
                H.overdue();
            }else{
                H.Modal(res.message);
            }
        });
    }

    createForm() {
        let adArea = [];
        this.state.areaList.map((area, index)=>{
            adArea.push(<option key={index} className="form-control" value={area.area_id}>{area.area_name}</option>);
        });

        return (<div className="section-filter" style={{marginBottom: '10px', overflow: 'hidden'}}>
            <form className="form-horizontal col-lg-12">
                <div className="form-inline">
                    <label className="control-label" style={{marginBottom: '20px'}}>地区
                        <select id="ad-area-select" className="form-control" onChange={this.toggleArea.bind(this)}
                                style={{margin: '0 20px'}}>{adArea}</select>
                    </label>
                </div>
                <div className="form-inline" style={{marginBottom: '20px'}}>
                    <label className="control-label">上架时间
                        <input id="ads-online" type="datetime-local" className="form-control" style={{margin: '0 20px'}} />
                    </label>
                    <label className="control-label">下架时间
                        <input id="ads-offline" type="datetime-local" className="form-control" style={{margin: '0 20px'}} />
                    </label>
                </div>
                <div className="form-inline">
                    <label className="control-label" style={{marginBottom: '20px'}}>标题
                        <input id="ad-title" type="text" className="form-control" style={{margin: '0 20px'}} />
                    </label>
                </div>
                <div className="form-inline">
                    <label className="control-label" style={{marginBottom: '20px'}}>显示时长
                        <input id="ad-time" type="number" className="form-control" style={{margin: '0 20px'}} />S
                    </label>
                </div>
                <div className="form-inline">
                    <label className="control-label" style={{marginBottom: '20px'}}>链接地址
                        <input id="ad-link" type="text" className="form-control" style={{margin: '0 20px'}} />
                    </label>
                </div>
                <div className="form-inline col-lg-12">
                    <div className="col-lg-1">
                        <a href="javascript:;" className="file-upload btn btn-sm btn-default">
                            上传图片
                            <input type="file" data-type="index" onChange={this.previewImg.bind(this)}/>
                        </a>
                    </div>
                    <div className="col-lg-3">
                        <img src="/images/noImg.jpg" id="ad-preview" style={{width: '100%', height: 'auto', borderRadius:'5px', border: '1px solid #d8d8d8'}}/>
                    </div>
                </div>
            </form>
        </div>);
    }

    toggleArea(e){
        let value = e.target.value;
        this.setState({
            currentArea: value
        });
    }

    previewImg(e) {
        var img = e.target.files[0];
        var suffix = img.name.substring(img.name.lastIndexOf('.')+1).toLowerCase();
        var allowSuffix = '.jpg,.gif,.png,.jpeg';
        var path = 'Public/Uploads/popUpAd/'+ (new Date).getTime() +''+Math.floor(Math.random()*10)+
            '.'+ suffix;

        if(allowSuffix.indexOf(suffix) == -1) {
            H.Modal('仅支持'+allowSuffix+'为后缀名的文件! @_@');
            return ;
        }

        // 预览
        $('#ad-preview').attr({'src': window.URL.createObjectURL(img),
            'data-upload':'upload',
            'data-type': img.type,
            'data-suffix': suffix,
            'data-path': path
        });

        var POLICY_JSON = {
            'expiration': '2120-12-01T12:00:00.000Z',
            'conditions': [
                ['starts-with', path, ''],
                {'bucket': 'idongpin'},
                ['starts-with', img.type, ''],
                ['content-length-range', 0, 104857600]
            ]
        };

        var policyBase64 = Base64.encode(JSON.stringify(POLICY_JSON));

        H.server.other_oss_signature({signature_data: policyBase64}, (res) => {
            if(res.code == 0) {
                var signature = res.data.signature;
                H.server.other_oss_identity_data({}, (res) => {
                    if(res.code == 0) {
                        var access_id = res.data.access_id;
                        var fd = new FormData();
                        //alert(file.type);
                        fd.append('key', path);  //上传到的路径信息;
                        fd.append('Content-Type', img.type);  //文件类型;
                        fd.append('Content-Length', Math.round(img.size * 100 / 1024) / 100);  //文件大小KB;
                        fd.append('Content-Encoding', 'compress');  //压缩方式，这里为无压缩;
                        fd.append('OSSAccessKeyId', access_id);
                        fd.append('policy', policyBase64);  //参与签名的头信息;
                        fd.append('signature', signature);  //签名;
                        fd.append('file', img);  //需上传的文件对像;

                        var xhr = new XMLHttpRequest();
                        //上传百分比的计算，目前没有用，因为OSS没有返回上传过程的数据;
                        //xhr.upload.addEventListener("progress", uploadProgress, false);
                        //完成后的请求
                        xhr.addEventListener('load', () => {
                            this.setState({
                                adImgPath: path
                            });
                        }, false);
                        //请求error
                        xhr.addEventListener('error', function() {
                            H.Modal('上传出现错误，您可以重新点击上传');
                        }, false);
                        //请求中断
                        xhr.addEventListener('abort', function() {
                            H.Modal('上传中断，请检查网络后重新上传');
                        }, false);
                        //发送请求
                        xhr.open('POST', 'http://oss-cn-qingdao.aliyuncs.com/idongpin', true);
                        xhr.send(fd);
                    }else if(res.code == 10106) {
                        H.overdue();
                    }else {
                        H.Modal(res.message);
                    }
                });
            }else if(res.code == 10106) {
                H.overdue();
            }else {
                H.Modal(res.message);
            }
        });
    }

    saveAd(){
        H.server.indexManage_add_ad({
            area_id: this.state.currentArea,
            put_on_at: $('#ads-online').val().split('T').join(' ')+':00',
            pull_off_at: $('#ads-offline').val().split('T').join(' ')+':00',
            ads_title:$('#ad-title').val(),
            show_time: parseInt($('#ad-time').val()),
            link_url: $('#ad-link').val(),
            image: this.state.adImgPath
        }, (res)=>{
            if(res.code == 0){
                this.props.closePanel && this.props.closePanel();
            }else if(res.code == 10106) {
                H.overdue();
            }else{
                H.Modal(res.message);
            }
        });
    }

    render(){
        return (<div className="waybill-info-container">
            <div className="waybill-info-head container-fluid">
                <h3 className="title">新增弹窗广告<button type="button" className="close" data-dismiss="modal" onClick={this.props.closePanel} style={{fontSize: '40px'}}>&times;</button></h3>
                <hr/>
                <div className="waybill-info-content" style={{overflowY:'scroll'}}>
                    {this.createForm()}
                    <div className="section-filter">
                        <a href="javascript:;" className="btn btn-lg btn-orange" onClick={this.saveAd.bind(this)}>提交确认</a>
                    </div>
                </div>
            </div>
        </div>);
    }
}

export default AddPopUpAd;