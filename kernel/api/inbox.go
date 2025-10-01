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

package api

import (
	"net/http"

	"github.com/88250/gulu"
	"github.com/gin-gonic/gin"
	"github.com/siyuan-note/siyuan/kernel/model"
	"github.com/siyuan-note/siyuan/kernel/util"
)

func removeShorthands(c *gin.Context) {
	ret := gulu.Ret.NewResult()
	defer c.JSON(http.StatusOK, ret)

	arg, ok := util.JsonArg(c, ret)
	if !ok {
		return
	}

	idsArg := arg["ids"].([]interface{})
	var ids []string
	for _, id := range idsArg {
		ids = append(ids, id.(string))
	}

	// 检查是否启用第三方收件箱
	if model.Conf.Sync.ThirdPartyInbox != nil && model.Conf.Sync.ThirdPartyInbox.Enabled {
		err := model.RemoveThirdPartyShorthands(ids)
		if err != nil {
			ret.Code = 1
			ret.Msg = err.Error()
			return
		}
	} else {
		err := model.RemoveCloudShorthands(ids)
		if err != nil {
			ret.Code = 1
			ret.Msg = err.Error()
			return
		}
	}
}

func getShorthand(c *gin.Context) {
	ret := gulu.Ret.NewResult()
	defer c.JSON(http.StatusOK, ret)

	arg, ok := util.JsonArg(c, ret)
	if !ok {
		return
	}

	id := arg["id"].(string)
	var data map[string]interface{}
	var err error

	// 检查是否启用第三方收件箱
	if model.Conf.Sync.ThirdPartyInbox != nil && model.Conf.Sync.ThirdPartyInbox.Enabled {
		data, err = model.GetThirdPartyShorthand(id)
	} else {
		data, err = model.GetCloudShorthand(id)
	}

	if err != nil {
		ret.Code = 1
		ret.Msg = err.Error()
		return
	}
	ret.Data = data
}

func getShorthands(c *gin.Context) {
	ret := gulu.Ret.NewResult()
	defer c.JSON(http.StatusOK, ret)

	arg, ok := util.JsonArg(c, ret)
	if !ok {
		return
	}

	page := int(arg["page"].(float64))
	var data map[string]interface{}
	var err error

	// 检查是否启用第三方收件箱
	if model.Conf.Sync.ThirdPartyInbox != nil && model.Conf.Sync.ThirdPartyInbox.Enabled {
		data, err = model.GetThirdPartyShorthands(page)
	} else {
		data, err = model.GetCloudShorthands(page)
	}

	if err != nil {
		ret.Code = 1
		ret.Msg = err.Error()
		return
	}
	ret.Data = data
}
