import {isPaidUser, needSubscribe} from "../util/needSubscribe";
import {fetchPost} from "../util/fetch";
import {showMessage} from "../dialog/message";
import {bindSyncCloudListEvent, getSyncCloudList} from "../sync/syncGuide";
import {processSync} from "../dialog/processSystem";
import {getCloudURL} from "./util/about";
import {openByMobile} from "../protyle/util/compatibility";
import {confirmDialog} from "../dialog/confirmDialog";

const renderProvider = (provider: number) => {
    // 移除 SiYuan 第一方选项 (provider === 0)
    // 只支持 S3、WebDAV 和本地文件系统
    // 移除付费用户检查，直接显示配置界面
    if (false) {
        return `<div>
    已禁用付费检查
</div>
<div class="ft__error${provider == 4 ? "" : " fn__none"}">
    <div class="fn__hr--b"></div>
    ${window.siyuan.languages.mobileNotSupport}
</div>`;
    }
    if (provider === 2) {
        return `<div class="b3-label b3-label--inner">
    ${window.siyuan.languages.syncThirdPartyProviderS3Intro}
    <div class="fn__hr"></div>
    <em>${window.siyuan.languages.proFeature}</em>
    <div class="fn__hr"></div>
    ${window.siyuan.languages.syncThirdPartyProviderTip}
</div>
<div class="b3-label b3-label--inner fn__flex">
    <div class="fn__flex-center fn__size200">Endpoint</div>
    <div class="fn__space"></div>
    <input id="endpoint" class="b3-text-field fn__block" value="${window.siyuan.config.sync.s3.endpoint}">
</div>
<div class="b3-label b3-label--inner fn__flex">
    <div class="fn__flex-center fn__size200">Access Key</div>
    <div class="fn__space"></div>
    <input id="accessKey" class="b3-text-field fn__block" value="${window.siyuan.config.sync.s3.accessKey}">
</div>
<div class="b3-label b3-label--inner fn__flex">
    <div class="fn__flex-center fn__size200">Secret Key</div>
    <div class="fn__space"></div>
    <div class="b3-form__icona fn__block">
        <input id="secretKey" type="password" class="b3-text-field b3-form__icona-input" value="${window.siyuan.config.sync.s3.secretKey}">
        <svg class="b3-form__icona-icon" data-action="togglePassword"><use xlink:href="#iconEye"></use></svg>
    </div>
</div>
<div class="b3-label b3-label--inner fn__flex">
    <div class="fn__flex-center fn__size200">Bucket</div>
    <div class="fn__space"></div>
    <input id="bucket" class="b3-text-field fn__block" value="${window.siyuan.config.sync.s3.bucket}">
</div>
<div class="b3-label b3-label--inner fn__flex">
    <div class="fn__flex-center fn__size200">Region ID</div>
    <div class="fn__space"></div>
    <input id="region" class="b3-text-field fn__block" value="${window.siyuan.config.sync.s3.region}">
</div>
<div class="b3-label b3-label--inner fn__flex">
    <div class="fn__flex-center fn__size200">Timeout (s)</div>
    <div class="fn__space"></div>
    <input id="timeout" class="b3-text-field fn__block" type="number" min="7" max="300" value="${window.siyuan.config.sync.s3.timeout}">
</div>
<div class="b3-label b3-label--inner fn__flex">
    <div class="fn__flex-center fn__size200">Addressing</div>
    <div class="fn__space"></div>
    <select class="b3-select fn__block" id="pathStyle">
        <option ${window.siyuan.config.sync.s3.pathStyle ? "selected" : ""} value="true">Path-style</option>
        <option ${window.siyuan.config.sync.s3.pathStyle ? "" : "selected"} value="false">Virtual-hosted-style</option>
    </select>
</div>
<div class="b3-label b3-label--inner fn__flex">
    <div class="fn__flex-center fn__size200">TLS Verify</div>
    <div class="fn__space"></div>
    <select class="b3-select fn__block" id="s3SkipTlsVerify">
        <option ${window.siyuan.config.sync.s3.skipTlsVerify ? "" : "selected"} value="false">Verify</option>
        <option ${window.siyuan.config.sync.s3.skipTlsVerify ? "selected" : ""} value="true">Skip</option>
    </select>
</div>
<div class="b3-label b3-label--inner fn__flex">
    <div class="fn__flex-center fn__size200">Concurrent Reqs</div>
    <div class="fn__space"></div>
    <input id="s3ConcurrentReqs" class="b3-text-field fn__block" type="number" min="1" max="16" value="${window.siyuan.config.sync.s3.concurrentReqs}">
</div>
<div class="b3-label b3-label--inner fn__flex">
    <div class="fn__flex-1"></div>
    <button class="b3-button b3-button--outline fn__size200" data-action="purgeData">
        <svg><use xlink:href="#iconTrashcan"></use></svg>${window.siyuan.languages.purge}
    </button>
    <div class="fn__space"></div>
    <button class="b3-button b3-button--outline fn__size200" style="position: relative">
        <input id="importData" class="b3-form__upload" type="file" data-type="s3">
        <svg><use xlink:href="#iconDownload"></use></svg>${window.siyuan.languages.import}
    </button>
    <div class="fn__space"></div>
    <button class="b3-button b3-button--outline fn__size200" data-action="exportData" data-type="s3">
        <svg><use xlink:href="#iconUpload"></use></svg>${window.siyuan.languages.export}
    </button>
</div>`;
    } else if (provider === 3) {
        return `<div class="b3-label b3-label--inner">
    ${window.siyuan.languages.syncThirdPartyProviderWebDAVIntro}
    <div class="fn__hr"></div>
    <em>${window.siyuan.languages.proFeature}</em>
    <div class="fn__hr"></div>
    ${window.siyuan.languages.syncThirdPartyProviderTip}
</div>
<div class="b3-label b3-label--inner fn__flex">
    <div class="fn__flex-center fn__size200">Endpoint</div>
    <div class="fn__space"></div>
    <input id="endpoint" class="b3-text-field fn__block" value="${window.siyuan.config.sync.webdav.endpoint}">
</div>
<div class="b3-label b3-label--inner fn__flex">
    <div class="fn__flex-center fn__size200">Username</div>
    <div class="fn__space"></div>
    <input id="username" class="b3-text-field fn__block" value="${window.siyuan.config.sync.webdav.username}">
</div>
<div class="b3-label b3-label--inner fn__flex">
    <div class="fn__flex-center fn__size200">Password</div>
    <div class="fn__space"></div>
    <div class="b3-form__icona fn__block">
        <input id="password" type="password" class="b3-text-field b3-form__icona-input" value="${window.siyuan.config.sync.webdav.password}">
        <svg class="b3-form__icona-icon" data-action="togglePassword"><use xlink:href="#iconEye"></use></svg>
    </div>
</div>
<div class="b3-label b3-label--inner fn__flex">
    <div class="fn__flex-center fn__size200">Timeout (s)</div>
    <div class="fn__space"></div>
    <input id="timeout" class="b3-text-field fn__block" type="number" min="7" max="300" value="${window.siyuan.config.sync.webdav.timeout}">
</div>
<div class="b3-label b3-label--inner fn__flex">
    <div class="fn__flex-center fn__size200">TLS Verify</div>
    <div class="fn__space"></div>
    <select class="b3-select fn__block" id="webdavSkipTlsVerify">
        <option ${window.siyuan.config.sync.webdav.skipTlsVerify ? "" : "selected"} value="false">Verify</option>
        <option ${window.siyuan.config.sync.webdav.skipTlsVerify ? "selected" : ""} value="true">Skip</option>
    </select>
</div>
<div class="b3-label b3-label--inner fn__flex">
    <div class="fn__flex-center fn__size200">Concurrent Reqs</div>
    <div class="fn__space"></div>
    <input id="webdavConcurrentReqs" class="b3-text-field fn__block" type="number" min="1" max="16" value="${window.siyuan.config.sync.webdav.concurrentReqs}">
</div>
<div class="b3-label b3-label--inner fn__flex">
    <div class="fn__flex-1"></div>
    <button class="b3-button b3-button--outline fn__size200" data-action="purgeData">
        <svg><use xlink:href="#iconTrashcan"></use></svg>${window.siyuan.languages.purge}
    </button>
    <div class="fn__space"></div>
    <button class="b3-button b3-button--outline fn__size200" style="position: relative">
        <input id="importData" class="b3-form__upload" type="file" data-type="webdav">
        <svg><use xlink:href="#iconDownload"></use></svg>${window.siyuan.languages.import}
    </button>
    <div class="fn__space"></div>
    <button class="b3-button b3-button--outline fn__size200" data-action="exportData" data-type="webdav">
        <svg><use xlink:href="#iconUpload"></use></svg>${window.siyuan.languages.export}
    </button>
</div>`;
    } else if (provider === 4) {
        return `<div class="b3-label b3-label--inner">
    <div class="ft__error">
        ${window.siyuan.languages.mobileNotSupport}
    </div>
    <div class="fn__hr"></div>
    ${window.siyuan.languages.syncThirdPartyProviderLocalIntro}
    <div class="fn__hr"></div>
    <em>${window.siyuan.languages.proFeature}</em>
</div>
<div class="b3-label b3-label--inner fn__flex">
    <div class="fn__flex-center fn__size200">Endpoint</div>
    <div class="fn__space"></div>
    <input id="endpoint" class="b3-text-field fn__block" value="${window.siyuan.config.sync.local.endpoint}">
</div>
<div class="b3-label b3-label--inner fn__flex">
    <div class="fn__flex-center fn__size200">Timeout (s)</div>
    <div class="fn__space"></div>
    <input id="timeout" class="b3-text-field fn__block" type="number" min="7" max="300" value="${window.siyuan.config.sync.local.timeout}">
</div>
<div class="b3-label b3-label--inner fn__flex">
    <div class="fn__flex-center fn__size200">Concurrent Reqs</div>
    <div class="fn__space"></div>
    <input id="localConcurrentReqs" class="b3-text-field fn__block" type="number" min="1" max="1024" value="${window.siyuan.config.sync.local.concurrentReqs}">
</div>`;
    }
    return "";
};

const bindProviderEvent = () => {
    const importElement = repos.element.querySelector("#importData") as HTMLInputElement;
    if (importElement) {
        importElement.addEventListener("change", () => {
            const formData = new FormData();
            formData.append("file", importElement.files[0]);
            const isS3 = importElement.getAttribute("data-type") === "s3";
            fetchPost(isS3 ? "/api/sync/importSyncProviderS3" : "/api/sync/importSyncProviderWebDAV", formData, (response) => {
                if (isS3) {
                    window.siyuan.config.sync.s3 = response.data.s3;
                } else {
                    window.siyuan.config.sync.webdav = response.data.webdav;
                }
                repos.element.querySelector("#syncProviderPanel").innerHTML = renderProvider(window.siyuan.config.sync.provider);
                bindProviderEvent();
                showMessage(window.siyuan.languages.imported);
                importElement.value = "";
            });
        });
    }

    const reposDataElement = repos.element.querySelector("#reposData");
    const loadingElement = repos.element.querySelector("#reposLoading");
    if (window.siyuan.config.sync.provider === 0) {
        if (false) {
        loadingElement.classList.add("fn__none");
        let nextElement = reposDataElement;
        while (nextElement) {
            nextElement.classList.add("fn__none");
            nextElement = nextElement.nextElementSibling;
        }
        return;
    }

    fetchPost("/api/cloud/getCloudSpace", {}, (response) => {
            loadingElement.classList.add("fn__none");
            if (response.code === 1) {
                reposDataElement.innerHTML = response.msg;
                return;
            } else {
                reposDataElement.innerHTML = `<div class="fn__flex">
    <div class="fn__flex-1">
        ${window.siyuan.languages.cloudStorage}
        <div class="fn__hr"></div>
        <ul class="b3-list" style="margin-left: 12px">
            <li class="b3-list-item" style="cursor: auto;">${window.siyuan.languages.sync}<span class="b3-list-item__meta">${response.data.sync ? response.data.sync.hSize : "0B"}</span></li>
            <li class="b3-list-item" style="cursor: auto;">${window.siyuan.languages.backup}<span class="b3-list-item__meta">${response.data.backup ? response.data.backup.hSize : "0B"}</span></li>
            <li class="b3-list-item" style="cursor: auto;"><a href="${getCloudURL("settings/file?type=3")}" target="_blank">${window.siyuan.languages.cdn}</a><span class="b3-list-item__meta">${response.data.hAssetSize}</span></li>
            <li class="b3-list-item" style="cursor: auto;">${window.siyuan.languages.total}<span class="b3-list-item__meta">${response.data.hSize}</span></li>
            <li class="b3-list-item" style="cursor: auto;">${window.siyuan.languages.sizeLimit}<span class="b3-list-item__meta">${response.data.hTotalSize}</span></li>
            <li class="b3-list-item" style="cursor: auto;"><a href="${getCloudURL("settings/point")}" target="_blank">${window.siyuan.languages.pointExchangeSize}</a><span class="b3-list-item__meta">${response.data.hExchangeSize}</span></li>
        </ul>
    </div>
    <div class="fn__flex-1">
        ${window.siyuan.languages.trafficStat}
        <div class="fn__hr"></div>
        <ul class="b3-list" style="margin-left: 12px">
            <li class="b3-list-item" style="cursor: auto;">${window.siyuan.languages.upload}<span class="fn__space"></span><span class="ft__on-surface">${response.data.hTrafficUploadSize}</span></li>
            <li class="b3-list-item" style="cursor: auto;">${window.siyuan.languages.download}<span class="fn__space"></span><span class="ft__on-surface">${response.data.hTrafficDownloadSize}</span></li>
            <li class="b3-list-item" style="cursor: auto;">API GET<span class="fn__space"></span><span class="ft__on-surface">${response.data.hTrafficAPIGet}</span></li>
            <li class="b3-list-item" style="cursor: auto;">API PUT<span class="fn__space"></span><span class="ft__on-surface">${response.data.hTrafficAPIPut}</span></li>
        </ul>
    </div>
</div>`;
            }
        });
        reposDataElement.classList.remove("fn__none");
        return;
    }

    loadingElement.classList.add("fn__none");
    let nextElement = reposDataElement.nextElementSibling;
    while (nextElement) {
        // 移除付费检查，显示所有功能
        nextElement.classList.remove("fn__none");
        nextElement = nextElement.nextElementSibling;
    }
    reposDataElement.classList.add("fn__none");
    const providerPanelElement = repos.element.querySelector("#syncProviderPanel");
    providerPanelElement.querySelectorAll(".b3-text-field, .b3-select").forEach(item => {
        item.addEventListener("blur", () => {
            if (window.siyuan.config.sync.provider === 2) {
                let timeout = parseInt((providerPanelElement.querySelector("#timeout") as HTMLInputElement).value, 10);
                if (7 > timeout) {
                    if (1 > timeout) {
                        timeout = 30;
                    } else {
                        timeout = 7;
                    }
                }
                if (300 < timeout) {
                    timeout = 300;
                }
                let concurrentReqs = parseInt((providerPanelElement.querySelector("#s3ConcurrentReqs") as HTMLInputElement).value, 10);
                if (1 > concurrentReqs) {
                    concurrentReqs = 1;
                }
                if (16 < concurrentReqs) {
                    concurrentReqs = 16;
                }
                (providerPanelElement.querySelector("#timeout") as HTMLInputElement).value = timeout.toString();
                let endpoint = (providerPanelElement.querySelector("#endpoint") as HTMLInputElement).value;
                endpoint = endpoint.trim().replace("http://http(s)://", "https://");
                endpoint = endpoint.replace("http(s)://", "https://");
                if (!endpoint.startsWith("http")) {
                    endpoint = "http://" + endpoint;
                }
                const s3 = {
                    endpoint: endpoint,
                    accessKey: (providerPanelElement.querySelector("#accessKey") as HTMLInputElement).value.trim(),
                    secretKey: (providerPanelElement.querySelector("#secretKey") as HTMLInputElement).value.trim(),
                    bucket: (providerPanelElement.querySelector("#bucket") as HTMLInputElement).value.trim(),
                    pathStyle: (providerPanelElement.querySelector("#pathStyle") as HTMLInputElement).value === "true",
                    region: (providerPanelElement.querySelector("#region") as HTMLInputElement).value.trim(),
                    skipTlsVerify: (providerPanelElement.querySelector("#s3SkipTlsVerify") as HTMLInputElement).value === "true",
                    timeout: timeout,
                    concurrentReqs: concurrentReqs,
                };
                fetchPost("/api/sync/setSyncProviderS3", {s3}, () => {
                    window.siyuan.config.sync.s3 = s3;
                });
            } else if (window.siyuan.config.sync.provider === 3) {
                let timeout = parseInt((providerPanelElement.querySelector("#timeout") as HTMLInputElement).value, 10);
                if (7 > timeout) {
                    timeout = 7;
                }
                if (300 < timeout) {
                    timeout = 300;
                }
                let concurrentReqs = parseInt((providerPanelElement.querySelector("#webdavConcurrentReqs") as HTMLInputElement).value, 10);
                if (1 > concurrentReqs) {
                    concurrentReqs = 1;
                }
                if (16 < concurrentReqs) {
                    concurrentReqs = 16;
                }
                (providerPanelElement.querySelector("#timeout") as HTMLInputElement).value = timeout.toString();
                let endpoint = (providerPanelElement.querySelector("#endpoint") as HTMLInputElement).value;
                endpoint = endpoint.trim().replace("http://http(s)://", "https://");
                endpoint = endpoint.replace("http(s)://", "https://");
                if (!endpoint.startsWith("http")) {
                    endpoint = "http://" + endpoint;
                }
                const webdav = {
                    endpoint: endpoint,
                    username: (providerPanelElement.querySelector("#username") as HTMLInputElement).value.trim(),
                    password: (providerPanelElement.querySelector("#password") as HTMLInputElement).value.trim(),
                    skipTlsVerify: (providerPanelElement.querySelector("#webdavSkipTlsVerify") as HTMLInputElement).value === "true",
                    timeout: timeout,
                    concurrentReqs: concurrentReqs,
                };
                fetchPost("/api/sync/setSyncProviderWebDAV", {webdav}, () => {
                    window.siyuan.config.sync.webdav = webdav;
                });
            } else if (window.siyuan.config.sync.provider === 4) {
                let timeout = parseInt((providerPanelElement.querySelector("#timeout") as HTMLInputElement).value, 10);
                if (7 > timeout) {
                    timeout = 7;
                }
                if (300 < timeout) {
                    timeout = 300;
                }
                let concurrentReqs = parseInt((providerPanelElement.querySelector("#localConcurrentReqs") as HTMLInputElement).value, 10);
                if (1 > concurrentReqs) {
                    concurrentReqs = 1;
                }
                if (1024 < concurrentReqs) {
                    concurrentReqs = 1024;
                }
                (providerPanelElement.querySelector("#timeout") as HTMLInputElement).value = timeout.toString();
                const local = {
                    endpoint: (providerPanelElement.querySelector("#endpoint") as HTMLInputElement).value,
                    timeout: timeout,
                    concurrentReqs: concurrentReqs,
                };
                fetchPost("/api/sync/setSyncProviderLocal", {local}, (response) => {
                    if (response.code === 0) {
                        window.siyuan.config.sync.local = response.data.local;

                        const endpoint = providerPanelElement.querySelector<HTMLInputElement>("#endpoint");
                        if (endpoint) {
                            endpoint.value = response.data.local.endpoint;
                        }
                    } else {
                        window.siyuan.config.sync.local = local;
                    }
                });
            }
        });
    });
};

export const repos = {
    element: undefined as Element,
    genHTML: () => {
        return `<div>
<div style="position: fixed;width: 800px;height: 434px;box-sizing: border-box;text-align: center;display: flex;align-items: center;justify-content: center;z-index: 1;" id="reposLoading">
    <img src="/stage/loading-pure.svg">
</div>
<div class="fn__flex-column">
    <!-- Tab Navigation -->
    <div class="layout-tab-bar fn__flex">
        <div data-type="syncProvider" class="item item--full item--focus">
            <span class="fn__flex-1"></span>
            <span class="item__text">同步存储</span>
            <span class="fn__flex-1"></span>
        </div>
        <div data-type="thirdPartyInbox" class="item item--full">
            <span class="fn__flex-1"></span>
            <span class="item__text">第三方收件箱</span>
            <span class="fn__flex-1"></span>
        </div>
    </div>

    <!-- Sync Provider Panel -->
    <div class="config-repos__panel" data-type="syncProvider" data-init="true">
        <div class="fn__flex b3-label config__item">
            <div class="fn__flex-1">
                ${window.siyuan.languages.syncProvider}
                <div class="b3-label__text">${window.siyuan.languages.syncProviderTip}</div>
            </div>
            <span class="fn__space"></span>
            <select id="syncProvider" class="b3-select fn__flex-center fn__size200">
                <option value="2" ${window.siyuan.config.sync.provider === 2 ? "selected" : ""}>S3</option>
                <option value="3" ${window.siyuan.config.sync.provider === 3 ? "selected" : ""}>WebDAV</option>
                <option value="4" ${window.siyuan.config.sync.provider === 4 ? "selected" : ""}>${window.siyuan.languages.localFileSystem}</option>
            </select>
        </div>
        <div id="syncProviderPanel" class="b3-label">
            ${renderProvider(window.siyuan.config.sync.provider)}
        </div>
        <div id="reposData" class="b3-label">
            <div class="fn__flex">
                <div class="fn__flex-1">
                    ${window.siyuan.languages.cloudStorage}
                </div>
                <div class="fn__flex-1">
                    ${window.siyuan.languages.trafficStat}
                </div>
            </div>
        </div>
        <label class="fn__flex b3-label">
            <div class="fn__flex-1">
                ${window.siyuan.languages.openSyncTip1}
                <div class="b3-label__text">${window.siyuan.languages.openSyncTip2}</div>
            </div>
            <span class="fn__space"></span>
            <input type="checkbox" id="reposCloudSyncSwitch"${window.siyuan.config.sync.enabled ? " checked='checked'" : ""} class="b3-switch fn__flex-center">
        </label>
        <label class="fn__flex b3-label">
            <div class="fn__flex-1">
                ${window.siyuan.languages.generateConflictDoc}
                <div class="b3-label__text">${window.siyuan.languages.generateConflictDocTip}</div>
            </div>
            <span class="fn__space"></span>
            <input type="checkbox" id="generateConflictDoc"${window.siyuan.config.sync.generateConflictDoc ? " checked='checked'" : ""} class="b3-switch fn__flex-center">
        </label>
        <div class="b3-label">
            <div class="fn__flex config__item">
                <div class="fn__flex-1">
                    ${window.siyuan.languages.syncMode}
                    <div class="b3-label__text">${window.siyuan.languages.syncModeTip}</div>
                </div>
                <span class="fn__space"></span>
                <select id="syncMode" class="b3-select fn__flex-center fn__size200">
                    <option value="1" ${window.siyuan.config.sync.mode === 1 ? "selected" : ""}>${window.siyuan.languages.syncMode1}</option>
                    <option value="2" ${window.siyuan.config.sync.mode === 2 ? "selected" : ""}>${window.siyuan.languages.syncMode2}</option>
                    <option value="3" ${window.siyuan.config.sync.mode === 3 ? "selected" : ""}>${window.siyuan.languages.syncMode3}</option>
                </select>
            </div>
    <div class="fn__flex b3-label${(window.siyuan.config.sync.mode !== 1) ? " fn__none" : ""}">
        <div class="fn__flex-1">
            ${window.siyuan.languages.syncInterval}
            <div class="b3-label__text">${window.siyuan.languages.syncIntervalTip}</div>
        </div>
        <span class="fn__space"></span>
        <input type="number" min="30" max="43200" id="syncInterval" class="b3-text-field fn__flex-center" value="${window.siyuan.config.sync.interval}" >
        <span class="fn__space"></span>
        <span class="fn__flex-center ft__on-surface">${window.siyuan.languages.second}</span>
    </div>
    <label class="fn__flex b3-label fn__none">
        <div class="fn__flex-1">
            ${window.siyuan.languages.syncPerception}
            <div class="b3-label__text">${window.siyuan.languages.syncPerceptionTip}</div>
        </div>
        <span class="fn__space"></span>
        <input type="checkbox" id="syncPerception"${window.siyuan.config.sync.perception ? " checked='checked'" : ""} class="b3-switch fn__flex-center">
    </label>
</div>
<div class="b3-label">
    <div class="fn__flex config__item">
        <div class="fn__flex-1">
            ${window.siyuan.languages.cloudSyncDir}
            <div class="b3-label__text">${window.siyuan.languages.cloudSyncDirTip}</div>
        </div>
        <div class="fn__space"></div>
        <button class="b3-button b3-button--outline fn__flex-center fn__size200" data-action="config">
            <svg><use xlink:href="#iconSettings"></use></svg>${window.siyuan.languages.config}
        </button>
    </div>
    <div id="reposCloudSyncList" class="fn__none b3-label"><img style="margin: 0 auto;display: block;width: 64px;height: 100%" src="/stage/loading-pure.svg"></div>
</div>
<div class="b3-label fn__flex">
    <div class="fn__flex-center">${window.siyuan.languages.cloudBackup}</div>
    <div class="b3-list-item__meta fn__flex-center">${window.siyuan.languages.cloudBackupTip}</div>
</div>
    </div>

    <!-- Third Party Inbox Panel -->
    <div class="config-repos__panel fn__none" data-type="thirdPartyInbox">
        <label class="fn__flex b3-label">
            <div class="fn__flex-1">
                第三方收件箱服务
                <div class="b3-label__text">启用后，收件箱数据将同步到第三方服务，而不是思源官方云端。请确保第三方服务兼容思源收件箱API格式。</div>
            </div>
            <span class="fn__space"></span>
            <input type="checkbox" id="thirdPartyInboxEnabled" ${window.siyuan.config.sync.thirdPartyInbox?.enabled || false ? "checked" : ""} class="b3-switch fn__flex-center">
        </label>

        <div class="fn__flex b3-label config__item">
            <div class="fn__flex-1">
                服务器地址
                <div class="b3-label__text">第三方收件箱服务器的完整URL地址</div>
            </div>
            <span class="fn__space"></span>
            <input id="thirdPartyInboxServerURL" class="b3-text-field fn__flex-center fn__size200" type="url"
                   value="${window.siyuan.config.sync.thirdPartyInbox?.serverUrl || ''}"
                   placeholder="https://inbox-worker.example.workers.dev">
        </div>

        <div class="fn__flex b3-label config__item">
            <div class="fn__flex-1">
                访问令牌
                <div class="b3-label__text">用于身份验证的访问令牌</div>
            </div>
            <span class="fn__space"></span>
            <div class="b3-form__icona fn__size200">
                <input id="thirdPartyInboxToken" type="password" class="b3-text-field b3-form__icona-input"
                       value="${window.siyuan.config.sync.thirdPartyInbox?.token || ''}"
                       placeholder="输入访问令牌">
                <svg class="b3-form__icona-icon" data-action="toggleThirdPartyInboxPassword"><use xlink:href="#iconEye"></use></svg>
            </div>
        </div>

        <div class="fn__flex b3-label config__item">
            <div class="fn__flex-1">
                同步间隔（分钟）
                <div class="b3-label__text">检查收件箱的间隔时间，建议设置为5-30分钟</div>
            </div>
            <span class="fn__space"></span>
            <input id="thirdPartyInboxSyncInterval" class="b3-text-field fn__flex-center fn__size200" type="number"
                   min="1" max="1440" value="${window.siyuan.config.sync.thirdPartyInbox?.syncInterval || 30}"
                   placeholder="30">
        </div>

        <div class="fn__flex b3-label config__item">
            <div class="fn__flex-1"></div>
            <span class="fn__space"></span>
            <button id="testThirdPartyInboxConnection" class="b3-button fn__flex-center fn__size200">测试连接</button>
            <div class="fn__space"></div>
            <button id="saveThirdPartyInboxConfig" class="b3-button fn__flex-center fn__size200">保存配置</button>
        </div>
    </div>
  </div>`;
    },
    bindEvent: () => {
        bindProviderEvent();
        const switchElement = repos.element.querySelector("#reposCloudSyncSwitch") as HTMLInputElement;
        switchElement.addEventListener("change", () => {
            if (switchElement.checked && window.siyuan.config.sync.cloudName === "") {
                switchElement.checked = false;
                showMessage(window.siyuan.languages._kernel[123]);
                return;
            }
            fetchPost("/api/sync/setSyncEnable", {enabled: switchElement.checked}, () => {
                window.siyuan.config.sync.enabled = switchElement.checked;
                processSync();
            });
        });
        const syncIntervalElement = repos.element.querySelector("#syncInterval") as HTMLInputElement;
        syncIntervalElement.addEventListener("change", () => {
            let interval = parseInt(syncIntervalElement.value);
            if (30 > interval) {
                interval = 30;
            }
            if (43200 < interval) {
                interval = 43200;
            }
            syncIntervalElement.value = interval.toString();
            fetchPost("/api/sync/setSyncInterval", {interval: interval}, () => {
                window.siyuan.config.sync.interval = interval;
                processSync();
            });
        });
        const syncPerceptionElement = repos.element.querySelector("#syncPerception") as HTMLInputElement;
        syncPerceptionElement.addEventListener("change", () => {
            fetchPost("/api/sync/setSyncPerception", {enabled: syncPerceptionElement.checked}, () => {
                window.siyuan.config.sync.perception = syncPerceptionElement.checked;
                processSync();
            });
        });
        const switchConflictElement = repos.element.querySelector("#generateConflictDoc") as HTMLInputElement;
        switchConflictElement.addEventListener("change", () => {
            fetchPost("/api/sync/setSyncGenerateConflictDoc", {enabled: switchConflictElement.checked}, () => {
                window.siyuan.config.sync.generateConflictDoc = switchConflictElement.checked;
            });
        });
        const syncModeElement = repos.element.querySelector("#syncMode") as HTMLSelectElement;
        syncModeElement.addEventListener("change", () => {
            fetchPost("/api/sync/setSyncMode", {mode: parseInt(syncModeElement.value, 10)}, () => {
                if (false && syncModeElement.value === "1" && window.siyuan.config.sync.provider === 0 && window.siyuan.config.system.container !== "docker") {
                    syncPerceptionElement.parentElement.classList.remove("fn__none");
                } else {
                    syncPerceptionElement.parentElement.classList.add("fn__none");
                }
                if (syncModeElement.value === "1") {
                    syncIntervalElement.parentElement.classList.remove("fn__none");
                } else {
                    syncIntervalElement.parentElement.classList.add("fn__none");
                }
                window.siyuan.config.sync.mode = parseInt(syncModeElement.value, 10);
            });
        });
        const syncConfigElement = repos.element.querySelector("#reposCloudSyncList");
        const syncProviderElement = repos.element.querySelector("#syncProvider") as HTMLSelectElement;
        syncProviderElement.addEventListener("change", () => {
            fetchPost("/api/sync/setSyncProvider", {provider: parseInt(syncProviderElement.value, 10)}, (response) => {
                if (response.code === 1) {
                    showMessage(response.msg);
                    // 移除SiYuan第一方选项，默认选择S3
                    syncProviderElement.value = "2";
                    window.siyuan.config.sync.provider = 2;
                } else {
                    window.siyuan.config.sync.provider = parseInt(syncProviderElement.value, 10);
                }
                repos.element.querySelector("#syncProviderPanel").innerHTML = renderProvider(window.siyuan.config.sync.provider);
                bindProviderEvent();
                syncConfigElement.innerHTML = "";
                syncConfigElement.classList.add("fn__none");
                if (true) { // 移除SiYuan第一方选项，总是隐藏同步感知设置
                    syncPerceptionElement.parentElement.classList.add("fn__none");
                } else {
                    syncPerceptionElement.parentElement.classList.remove("fn__none");
                }
                if (window.siyuan.config.sync.mode !== 1) {
                    syncIntervalElement.parentElement.classList.add("fn__none");
                } else {
                    syncIntervalElement.parentElement.classList.remove("fn__none");
                }
            });
        });
        const loadingElement = repos.element.querySelector("#reposLoading") as HTMLElement;
        loadingElement.style.width = repos.element.clientWidth + "px";
        loadingElement.style.height = repos.element.clientHeight + "px";
        bindSyncCloudListEvent(syncConfigElement);

        // Tab switching logic
        const tabBarElement = repos.element.querySelector(".layout-tab-bar");
        tabBarElement.addEventListener("click", (event) => {
            let target = event.target as HTMLElement;
            while (target && target !== tabBarElement) {
                const tabType = target.getAttribute("data-type");
                if (tabType && ["syncProvider", "thirdPartyInbox"].includes(tabType)) {
                    // Switch tab
                    repos.element.querySelectorAll(".layout-tab-bar .item").forEach(item => {
                        item.classList.remove("item--focus");
                    });
                    target.classList.add("item--focus");

                    // Switch panel
                    repos.element.querySelectorAll(".config-repos__panel").forEach(panel => {
                        panel.classList.add("fn__none");
                    });
                    repos.element.querySelector(`.config-repos__panel[data-type="${tabType}"]`).classList.remove("fn__none");
                    break;
                }
                target = target.parentElement;
            }
        });

        // Third party inbox configuration events
        const saveThirdPartyInboxConfigElement = repos.element.querySelector("#saveThirdPartyInboxConfig");
        const testThirdPartyInboxConnectionElement = repos.element.querySelector("#testThirdPartyInboxConnection");

        if (saveThirdPartyInboxConfigElement) {
            saveThirdPartyInboxConfigElement.addEventListener("click", () => {
                const config = {
                    enabled: (repos.element.querySelector("#thirdPartyInboxEnabled") as HTMLInputElement).checked,
                    serverUrl: (repos.element.querySelector("#thirdPartyInboxServerURL") as HTMLInputElement).value.trim(),
                    token: (repos.element.querySelector("#thirdPartyInboxToken") as HTMLInputElement).value.trim(),
                    syncInterval: parseInt((repos.element.querySelector("#thirdPartyInboxSyncInterval") as HTMLInputElement).value) || 30
                };

                if (config.enabled && (!config.serverUrl || !config.token)) {
                    showMessage("请填写服务器地址和访问令牌");
                    return;
                }

                if (config.serverUrl && !isValidUrl(config.serverUrl)) {
                    showMessage("请输入有效的服务器地址URL");
                    return;
                }

                if (config.syncInterval < 1 || config.syncInterval > 1440) {
                    showMessage("同步间隔必须在1-1440分钟之间");
                    return;
                }

                fetchPost("/api/sync/setThirdPartyInbox", {config}, (response) => {
                    if (response.code === 0) {
                        showMessage("配置保存成功");
                        window.siyuan.config.sync.thirdPartyInbox = config;
                    } else {
                        showMessage("配置保存失败: " + response.msg);
                    }
                });
            });
        }

        if (testThirdPartyInboxConnectionElement) {
            testThirdPartyInboxConnectionElement.addEventListener("click", () => {
                const serverUrl = (repos.element.querySelector("#thirdPartyInboxServerURL") as HTMLInputElement).value.trim();
                const token = (repos.element.querySelector("#thirdPartyInboxToken") as HTMLInputElement).value.trim();

                if (!serverUrl || !token) {
                    showMessage("请先填写服务器地址和访问令牌");
                    return;
                }

                if (!isValidUrl(serverUrl)) {
                    showMessage("请输入有效的服务器地址URL");
                    return;
                }

                showMessage("正在测试连接...");
                fetchPost("/api/sync/testThirdPartyInbox", {serverUrl, token}, (response) => {
                    if (response.code === 0) {
                        showMessage("连接测试成功");
                    } else {
                        showMessage("连接测试失败: " + response.msg);
                    }
                });
            });
        }

        // URL validation function
        function isValidUrl(url: string): boolean {
            try {
                new URL(url);
                return true;
            } catch {
                return false;
            }
        }

        // Handle password visibility toggle for third party inbox
        repos.element.addEventListener("click", (event) => {
            let target = event.target as HTMLElement;
            while (target && target !== repos.element) {
                const action = target.getAttribute("data-action");
                if (action === "toggleThirdPartyInboxPassword") {
                    const passwordInput = target.previousElementSibling as HTMLInputElement;
                    const isEye = target.firstElementChild.getAttribute("xlink:href") === "#iconEye";
                    target.firstElementChild.setAttribute("xlink:href", isEye ? "#iconEyeoff" : "#iconEye");
                    passwordInput.setAttribute("type", isEye ? "text" : "password");
                    break;
                }
                target = target.parentElement;
            }
        });

        repos.element.firstElementChild.addEventListener("click", (event) => {
            let target = event.target as HTMLElement;
            while (target && target !== repos.element) {
                const action = target.getAttribute("data-action");
                if (action === "config") {
                    if (syncConfigElement.classList.contains("fn__none")) {
                        getSyncCloudList(syncConfigElement, true);
                        syncConfigElement.classList.remove("fn__none");
                    } else {
                        syncConfigElement.classList.add("fn__none");
                    }
                    break;
                } else if (action === "exportData") {
                    fetchPost(target.getAttribute("data-type") === "s3" ? "/api/sync/exportSyncProviderS3" : "/api/sync/exportSyncProviderWebDAV", {}, response => {
                        openByMobile(response.data.zip);
                    });
                    break;
                } else if (action === "purgeData") {
                    confirmDialog("♻️ " + window.siyuan.languages.cloudStoragePurge, `<div class="b3-typography">${window.siyuan.languages.cloudStoragePurgeConfirm}</div>`, () => {
                        fetchPost("/api/repo/purgeCloudRepo");
                    });
                    break;
                }
                target = target.parentElement;
            }
        });
    },
};
