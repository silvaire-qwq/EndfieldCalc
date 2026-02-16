#!/bin/bash

function divider() {
	echo -e "\e[90m$(yes "\e[90m─\e[0m" | sed ''''$(stty size | awk '{print $2}')'''q' | tr -d '\n')\e[0m"
}

function red() {
	echo -e "\e[31;1m!!!\e[0;1m $@\e[0m"
}
function yellow() {
	echo -e "\e[33;1m!!!\e[0;1m $@\e[0m"
}
function h2() {
	echo -e "\e[36;1m--- $@\e[0m"
}
function green() {
	echo -e "\e[32;1m>>>\e[0;1m $@\e[0m"
}
function choose() {
	echo -e -n "\e[34;1mδ\e[0m $@ \e[1m[\e[32mY\e[0;1m/\e[31mn\e[0;1m]\e[0m "
	read user_choice
	if [[ $(echo $user_choice | grep -i "n") ]]; then
		export return=false
	else
		export return=true
	fi
}
function ask() {
	echo -e -n "\e[33;1mε\e[0m $@"
	read user_entered
	[[ $user_entered ]] || export user_entered=0
	export return=$user_entered
}

h2 "终末地保底计算器"
ask "卡池已垫抽数为 "
export alreadyPass=$return

ask "持有嵌晶玉数量为 "
export readyStone=$return

ask "持有特许寻访凭证数量为 "
export readyPass=$return

ask "需要特别补充的嵌晶玉数量（例如当期活动赠送但未领取部分）为 "
export clockStone=$return

ask "需要特别补充的特许寻访凭证数量（例如当期活动赠送但未领取部分）为 "
export clockPass=$return

choose "是否持有上个卡池得到的十连转换凭证？"
export readyTen=$return

choose "是否参与卡池 7 日签到（最高可获得 5 抽）？"
export signEveryDay=$return

choose "是否参与 17 日每日任务？（每次 200 嵌晶玉）？"
export taskEveryDay=$return

# 现存最大抽数
if [[ $readyTen == true ]]; then
	export readyPre=10
else
	export readyPre=0
fi
if [[ $signEveryDay == true ]]; then
	export signPass=5
else
	export signPass=0
fi
if [[ $taskEveryDay == true ]]; then
	export signStone=3400
else
	export signStone=0
fi
# 可计入配额
export nowTotalPass=$(((readyStone + clockStone + signStone) / 500 + readyPre + signPass + readyPass + clockPass))
if [[ $readyTen -ge 30 ]]; then
	export newTotalBrc=$((nowTotalPass + 10))
else
	export newTotalBrc=$nowTotalPass
fi
# 红配额
export redPass=$(((newTotalBrc / 10) * 10 / 25))
# 蓝配额
export bluePass=$((newTotalBrc - (newTotalBrc / 10) * 20 / 75))
if [[ bluePass -gt 5 ]]; then
	export bluePass=5
fi
# 计入保底抽数
export afterCalcBiggest=$((nowTotalPass + redPass + bluePass))

# 距离小保底抽数
export littleTotal=$((80 - afterCalcBiggest - alreadyPass))

# 距离大保底抽数
export grandTotal=$((120 - afterCalcBiggest))

# 计算总可用抽数（已垫抽数 + 可抽总数）
export totalAvailablePass=$((alreadyPass + afterCalcBiggest))

# 1. 计算小保底次数和剩余/需补充抽数
export littleGuaranteeCount=$((totalAvailablePass / 80)) # 小保底次数（每80抽一次）
export littleRemainPass=$((totalAvailablePass % 80))     # 小保底剩余抽数
export littleNeedPass=$((80 - littleRemainPass))         # 达到下一次小保底还需抽数

# 2. 计算大保底次数和剩余/需补充抽数
export grandGuaranteeCount=$((totalAvailablePass / 120)) # 大保底次数（每120抽一次）
export grandRemainPass=$((totalAvailablePass % 120))     # 大保底剩余抽数
export grandNeedPass=$((120 - grandRemainPass))          # 达到下一次大保底还需抽数

h2 "计算结果"

# 小保底输出优化
if [[ $littleGuaranteeCount -eq 0 ]]; then
	yellow "小保底：还需 $littleNeedPass 抽达到首次小保底"
else
	green "小保底：可达到 $littleGuaranteeCount 次，剩余 $littleRemainPass 抽"
fi

# 大保底输出优化
if [[ $grandGuaranteeCount -eq 0 ]]; then
	yellow "大保底：还需 $grandNeedPass 抽达到首次大保底"
else
	green "大保底：可达到 $grandGuaranteeCount 次，剩余 $grandRemainPass 抽"
fi
