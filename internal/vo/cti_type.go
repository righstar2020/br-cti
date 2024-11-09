package vo


//CTI类型的值对象
type CTIType struct {
	OSINTID   string    `json:"osint_id"` //开源CTI编号
}

//钓鱼IP信息
type PhishingIP struct {
	*CTIType
	IP        string `json:"ip"`  //钓鱼IP地址
	PublishTime     string    `json:"publish_time"` //发布时间
}

//主机端恶意软件
type PcMalware struct {
	*CTIType
	Name      string 	`json:"name"`	//病毒名称
	OS        string 	`json:"os"`	//操作系统(win32、linux等)
	MD5		  string 	`json:"md5"`  //病毒md5
	PublishTime     string    `json:"publish_time"` //发布时间
}

//木马
type Trojan struct {
	*CTIType
	TrojanIP  string `json:"trojan_ip"`	//放马IP
	TrojanMD5 string `json:"trojan_md5"` //放马md5
	PublishTime string `json:"publish_time"`
}

//C2 
type C2 struct {
	*CTIType
	C2IP      string `json:"c2_ip"`	//C2 IP
	C2Domain     string `json:"c2_domain"` //C2域名
	PublishTime string `json:"publish_time"`
}

type MalEmail struct {
	*CTIType
	Email     string `json:"email"`	//恶意邮箱
	PublishTime string `json:"publish_time"`
}

type MalPhone struct{
	*CTIType
	Phone     string `json:"phone"` //恶意电话
	PublishTime string `json:"publish_time"`
}

type MalSocialAccount struct{
	*CTIType
	Platform string `json:"platform"` //平台名称
	Account     string `json:"account"` //账号名
	PublishTime string `json:"publish_time"`
}

type BotNet struct {
	*CTIType
	Name 	  string `json:"name"`       //僵尸网络名
	BotnetIP  string `json:"botnet_ip"`	//botnet 主控IP
	Location  string `json:"location"`  //所在地区
	PublishTime string `json:"publish_time"`
 }

 type DDoS struct {
	OSINTID   string    `json:"osint_id"` 		//开源CTI编号
	DDoSIP    string `json:"ddos_ip"`			//DDoS IP
	AttackType string `json:"attack_type"` 		//攻击类型
	PublishTime string `json:"publish_time"`
}

type OpenSourceCTI struct{
	*CTIType
	Tags string  `json:"tags"` //标签
	Publisher string   `json:"publisher"` //发布者
	Data string  `json:"data"` //详细内容
	PublishTime string `json:"publish_time"`
}

type CTIContent struct {
	*CTIType
}