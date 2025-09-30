import {openModel} from "../menu/model";
import {Constants} from "../../constants";

export const login = () => {
    // 简单的登录函数，直接显示账户信息
    showAccountInfo();
};

export const showAccountInfo = () => {
    // 移除账号登录功能，显示本地模式信息
    const subscriptionHTML = `<div class="b3-chip b3-chip--secondary">${Constants.SIYUAN_IMAGE_VIP}终身会员</div>`;

    openModel({
        title: "本地模式",
        icon: "iconAccount",
        html: `<div class="fn__flex-column" style="text-align: center; padding: 1rem;">
<div>
    <div style="font-size: 1.2em; margin-bottom: 1rem;">SiYuan 笔记</div>
    <div style="color: var(--b3-theme-on-surface); margin-bottom: 1rem;">
        本地修改版本
    </div>
    ${subscriptionHTML}
    <div style="margin-top: 1rem;">
        <p>所有功能已解锁</p>
        <p style="color: var(--b3-theme-on-surface); font-size: 0.9em;">
            无需登录，无需付费
        </p>
    </div>
    <div class="fn__hr--b"></div>
    <div style="margin-top: 1rem;">
        <p>支持的功能：</p>
        <ul style="text-align: left; display: inline-block;">
            <li>✓ 完整的笔记功能</li>
            <li>✓ 数据同步 (S3/WebDAV/本地)</li>
            <li>✓ 导出功能</li>
            <li>✓ 插件系统</li>
            <li>✓ 主题定制</li>
        </ul>
    </div>
</div>
</div>`,
        bindCallback: (model) => {
            // 移除所有事件绑定
        }
    });
};