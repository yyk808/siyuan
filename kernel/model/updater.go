// SiYuan - Refactor your thinking
// Copyright (c) 2020-present, b3log.org
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

package model

import (
	"context"
	"fmt"

	"github.com/siyuan-note/logging"
	"github.com/siyuan-note/siyuan/kernel/util"
	"golang.org/x/mod/semver"
)


type Announcement struct {
	Id     string `json:"id"`
	Title  string `json:"title"`
	URL    string `json:"url"`
	Region int    `json:"region"`
}

func getAnnouncements() (ret []*Announcement) {
	result, err := util.GetRhyResult(context.TODO(), false)
	if err != nil {
		logging.LogErrorf("get announcement failed: %s", err)
		return
	}

	if nil == result["announcement"] {
		return
	}

	announcements := result["announcement"].([]any)
	for _, announcement := range announcements {
		ann := announcement.(map[string]any)
		ret = append(ret, &Announcement{
			Id:     ann["id"].(string),
			Title:  ann["title"].(string),
			URL:    ann["url"].(string),
			Region: int(ann["region"].(float64)),
		})
	}
	return
}

// CheckUpdate checks whether the upstream has a new version and notifies the user.
// Downloading or installing the new version is not supported in this fork.
func CheckUpdate(showMsg bool) {
	if !showMsg {
		return
	}

	if Conf.System.IsMicrosoftStore {
		return
	}

	result, err := util.GetRhyResult(context.TODO(), showMsg)
	if err != nil {
		return
	}

	ver := result["ver"].(string)
	releaseLang := result["release"].(string)
	if releaseLangArg := result["release_"+Conf.Lang]; nil != releaseLangArg {
		releaseLang = releaseLangArg.(string)
	}

	if isVersionUpToDate(ver) {
		util.PushUpdateMsg("update-notify", Conf.Language(10), 3000)
	} else {
		util.PushUpdateMsg("update-notify", fmt.Sprintf(Conf.Language(9), "<a href=\""+releaseLang+"\">"+releaseLang+"</a>"), 15000)
	}
}

func isVersionUpToDate(releaseVer string) bool {
	return semver.Compare("v"+releaseVer, "v"+util.Ver) <= 0
}
