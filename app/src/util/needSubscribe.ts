import {showMessage} from "../dialog/message";
import {getCloudURL} from "../config/util/about";

export const needSubscribe = (tip = window.siyuan.languages._kernel[29]) => {
    // 移除付费限制，所有功能免费使用
    return false;
};

export const isPaidUser = () => {
    // 移除付费检查，所有用户都被视为付费用户
    return true;
};
