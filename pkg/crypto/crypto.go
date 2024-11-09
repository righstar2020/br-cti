package crypto

import (
	"errors"
	"io"
	"mime/multipart"
	"os"
	"path"
	"strings"

	"github.com/righstar2020/br-cti/pkg/convert"
	"github.com/righstar2020/br-cti/pkg/utils/gregex"
	"github.com/righstar2020/br-cti/pkg/utils/gstr"

	"github.com/righstar2020/br-cti/global"
	"github.com/righstar2020/br-cti/pkg/utils"
)

//对文件进行加密
// @param file 文件对象
func EncryptFile(file *multipart.FileHeader) (string, error) {
	// 检查文件大小
	fileSize := file.Size
	maxSize := global.AppSetting.UploadImageMaxSize
	ok, err := CheckFileSize(fileSize, maxSize)
	if !ok {
		return "", err
	}

	// 检查文件后缀
	ext := GetFileExt(file.Filename)
	ok = CheckContainExt(TypeImage, ext)
	if !ok {
		return "", errors.New("上传文件格式不正确")
	}
	return utils.SaveImage(file.Filename, utils.ImagePath())
}
func AESDecryptString() (string, error) {
	return "",nil
}
//AES加密
func AESDecryptFile(file *multipart.FileHeader) (string, error) {
	return "",nil
}



type FileType int

const TypeImage FileType = iota + 1

func GetFileName(name string) string {
	ext := GetFileExt(name)
	fileName := strings.TrimSuffix(name, ext)
	fileName = utils.MD5(fileName)

	return fileName + ext
}

func GetFileExt(name string) string {
	return path.Ext(name)
}

func GetSavePath() string {
	return global.AppSetting.UploadSavePath
}

func GetServerUrl() string {
	return global.AppSetting.UploadServerUrl
}

func CheckSavePath(dst string) bool {
	_, err := os.Stat(dst)

	return os.IsNotExist(err)
}

func CheckContainExt(t FileType, name string) bool {
	ext := GetFileExt(name)
	ext = strings.ToUpper(ext)
	switch t {
	case TypeImage:
		for _, allowExt := range global.AppSetting.UploadImageAllowExts {
			if strings.ToUpper(allowExt) == ext {
				return true
			}
		}

	}

	return false
}

// 检查上传文件大小
func CheckFileSize(fileSize int64, maxSize string) (bool, error) {
	// 匹配上传文件最大值
	match, err := gregex.MatchString(`^([0-9]+)(?i:([a-z]*))$`, maxSize)
	if err != nil {
		return false, err
	}
	if len(match) == 0 {
		err = errors.New("上传文件大小未设置，请在后台配置，格式为（30M,30k,30MB）")
		return false, err
	}
	var cfSize int64
	switch gstr.ToUpper(match[2]) {
	case "MB", "M":
		cfSize = convert.Int64(match[1]) * 1024 * 1024
	case "KB", "K":
		cfSize = convert.Int64(match[1]) * 1024
	case "":
		cfSize = convert.Int64(match[1])
	}
	if cfSize == 0 {
		err = errors.New("上传文件大小未设置，请在后台配置，格式为（30M,30k,30MB），最大单位为MB")
		return false, err
	}
	return cfSize >= fileSize, nil
}

func CheckPermission(dst string) bool {
	_, err := os.Stat(dst)

	return os.IsPermission(err)
}

func CreateSavePath(dst string, perm os.FileMode) error {
	err := os.MkdirAll(dst, perm)
	if err != nil {
		return err
	}

	return nil
}

func SaveFile(file *multipart.FileHeader, dst string) error {
	src, err := file.Open()
	if err != nil {
		return err
	}
	defer src.Close()

	out, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer out.Close()

	_, err = io.Copy(out, src)
	return err
}
