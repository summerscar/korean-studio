import { papagoTranslateAction } from "@/actions/papago-translate-action";
import nodemailer from "nodemailer";

export async function healthCheck() {
	try {
		// 用一段简单的韩文测试
		const result = await papagoTranslateAction("안녕하세요", "zh-CN");
		return result;
	} catch (error: any) {
		// 发送邮件
		await sendErrorMail(error?.message || String(error));
		throw error;
	}
}

// 邮件发送函数
async function sendErrorMail(errorMsg: string) {
	// 邮箱配置
	const transporter = nodemailer.createTransport({
		host: process.env.EMAIL_HOST,
		port: 465,
		secure: true,
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PWD,
		},
	});

	await transporter.sendMail({
		from: `"Papago Health" <${process.env.EMAIL_USER}>`,
		to: process.env.EMAIL_TO,
		subject: "Papago 翻译服务异常告警",
		text: `Papago 翻译服务检测失败，错误信息：${errorMsg}`,
	});

	console.log('Email send')
}
