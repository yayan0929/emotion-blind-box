import nodemailer from 'nodemailer'

// 创建邮件传输器
const createTransporter = () => {
  // 如果环境变量中没有配置SMTP，则返回null
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('邮件服务未配置，将在开发环境模拟邮件发送')
    return null
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

// 发送邮件
export const sendEmail = async (
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // 开发环境或未配置邮件服务时，只打印日志
    if (process.env.NODE_ENV === 'development' || !process.env.SMTP_HOST) {
      console.log(`
========== 邮件发送模拟 ==========
收件人: ${to}
主题: ${subject}
HTML内容: ${html}
===============================
      `)
      return { success: true }
    }

    const transporter = createTransporter()
    if (!transporter) {
      return { success: false, error: '邮件服务未配置' }
    }

    const mailOptions = {
      from: process.env.SMTP_USER,
      to,
      subject,
      html,
      text,
    }

    await transporter.sendMail(mailOptions)
    return { success: true }
  } catch (error) {
    console.error('邮件发送失败:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '未知错误' 
    }
  }
}

// 发送验证码邮件
export const sendVerificationEmail = async (
  to: string,
  code: string,
  type: 'REGISTER' | 'LOGIN' | 'RESET_PASSWORD'
): Promise<{ success: boolean; error?: string }> => {
  const typeText = {
    REGISTER: '注册',
    LOGIN: '登录',
    RESET_PASSWORD: '重置密码'
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
        <h2 style="color: #333; margin-bottom: 20px;">大学生情绪盲盒交换站</h2>
        <h3 style="color: #555; margin-bottom: 15px;">${typeText[type]}验证码</h3>
        <p style="font-size: 18px; font-weight: bold; margin-bottom: 15px; background-color: #f1f1f1; padding: 10px; text-align: center; border-radius: 4px;">
          ${code}
        </p>
        <p style="color: #666; font-size: 14px;">
          请在10分钟内使用此验证码，过期后将无效。
        </p>
        <p style="color: #888; font-size: 12px; margin-top: 20px;">
          如果这不是您的操作，请忽略此邮件。
        </p>
      </div>
    </div>
  `

  const text = `
    大学生情绪盲盒交换站
    
    ${typeText[type]}验证码: ${code}
    
    请在10分钟内使用此验证码，过期后将无效。
    
    如果这不是您的操作，请忽略此邮件。
  `

  return sendEmail(to, `大学生情绪盲盒交换站 - ${typeText[type]}验证码`, html, text)
}

// 发送欢迎邮件
export const sendWelcomeEmail = async (
  to: string,
  username: string
): Promise<{ success: boolean; error?: string }> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
        <h2 style="color: #333; margin-bottom: 20px;">欢迎来到大学生情绪盲盒交换站</h2>
        <p style="color: #555; margin-bottom: 15px;">
          亲爱的 ${username}，欢迎您！
        </p>
        <p style="color: #555; margin-bottom: 15px;">
          感谢您注册我们的平台。在这里，您可以：
        </p>
        <ul style="color: #555; margin-bottom: 15px; padding-left: 20px;">
          <li>创建和分享您的情绪盲盒</li>
          <li>随机抽取他人的盲盒并回复</li>
          <li>收获温暖和友谊</li>
        </ul>
        <p style="color: #666; font-size: 14px;">
          让我们共同营造一个温暖、互助的情绪交流环境！
        </p>
        <p style="color: #888; font-size: 12px; margin-top: 20px;">
          如果这不是您的操作，请忽略此邮件。
        </p>
      </div>
    </div>
  `

  const text = `
    欢迎来到大学生情绪盲盒交换站
    
    亲爱的 ${username}，欢迎您！
    
    感谢您注册我们的平台。在这里，您可以：
    - 创建和分享您的情绪盲盒
    - 随机抽取他人的盲盒并回复
    - 收获温暖和友谊
    
    让我们共同营造一个温暖、互助的情绪交流环境！
    
    如果这不是您的操作，请忽略此邮件。
  `

  return sendEmail(to, `欢迎加入大学生情绪盲盒交换站`, html, text)
}

// 发送密码重置确认邮件
export const sendPasswordResetEmail = async (
  to: string,
  username: string
): Promise<{ success: boolean; error?: string }> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
        <h2 style="color: #333; margin-bottom: 20px;">密码重置成功</h2>
        <p style="color: #555; margin-bottom: 15px;">
          亲爱的 ${username}，
        </p>
        <p style="color: #555; margin-bottom: 15px;">
          您的密码已成功重置。现在可以使用新密码登录您的账户。
        </p>
        <div style="margin: 20px 0; text-align: center;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" 
             style="background-color: #4a6cf7; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
            登录账户
          </a>
        </div>
        <p style="color: #888; font-size: 12px; margin-top: 20px;">
          如果这不是您的操作，请立即联系我们的客服团队。
        </p>
      </div>
    </div>
  `

  const text = `
    密码重置成功
    
    亲爱的 ${username}，
    
    您的密码已成功重置。现在可以使用新密码登录您的账户。
    
    请访问以下链接登录：
    ${process.env.FRONTEND_URL || 'http://localhost:5173'}/login
    
    如果这不是您的操作，请立即联系我们的客服团队。
  `

  return sendEmail(to, `大学生情绪盲盒交换站 - 密码重置成功`, html, text)
}