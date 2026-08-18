import { supabase } from '../lib/supabase'

export interface CustomerSignupData {
  fullName: string
  email: string
  phone: string
  password: string
}

export interface CustomerUpdateData {
  name: string
  phone: string
}

// ==============================
// Signup
// ==============================

export const signupCustomer = async (
  data: CustomerSignupData
) => {
  const email = data.email.trim().toLowerCase()
  const name = data.fullName.trim()
  const phone = data.phone.trim()

  if (!name) {
    throw new Error('กรุณากรอกชื่อ-นามสกุล')
  }

  if (!email) {
    throw new Error('กรุณากรอกอีเมล')
  }

  if (!phone) {
    throw new Error('กรุณากรอกเบอร์โทรศัพท์')
  }

  if (!data.password) {
    throw new Error('กรุณากรอกรหัสผ่าน')
  }

  if (data.password.length < 6) {
    throw new Error('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
  }

  // ==============================
  // ตรวจสอบ Email ซ้ำ
  // ==============================

  const {
    data: existingCustomer,
    error: checkError
  } = await supabase
    .from('customer')
    .select('customer_id')
    .eq('email', email)
    .maybeSingle()

  if (checkError) {
    console.error('CHECK CUSTOMER ERROR:', checkError)

    throw new Error(
      `ตรวจสอบข้อมูลไม่สำเร็จ: ${checkError.message}`
    )
  }

  if (existingCustomer) {
    throw new Error('อีเมลนี้ถูกสมัครสมาชิกแล้ว')
  }

  // ==============================
  // สร้าง Supabase Auth
  // ==============================

  const {
    data: authData,
    error: authError
  } = await supabase.auth.signUp({
    email,
    password: data.password,
    options: {
      data: {
        name,
        phone
      }
    }
  })

  if (authError) {
    console.error('AUTH SIGNUP ERROR:', authError)

    throw new Error(authError.message)
  }

  if (!authData.user) {
    throw new Error('ไม่สามารถสร้างบัญชีได้')
  }

  // ==============================
  // สร้าง Customer
  // ==============================

  const {
    data: customerData,
    error: customerError
  } = await supabase
    .from('customer')
    .insert({
      auth_user_id: authData.user.id,
      name,
      email,
      phone
    })
    .select(
      'customer_id, auth_user_id, name, email, phone'
    )
    .single()

  if (customerError) {
    console.error(
      'CUSTOMER INSERT ERROR:',
      customerError
    )

    throw new Error(
      `บันทึกข้อมูล customer ไม่สำเร็จ: ${customerError.message}`
    )
  }

  // ==============================
  // เก็บ Customer
  // ==============================

  localStorage.setItem(
    'customer',
    JSON.stringify(customerData)
  )

  return {
    user: authData.user,
    customer: customerData,
    session: authData.session
  }
}


// ==============================
// Login
// ==============================

export const loginCustomer = async (
  email: string,
  password: string
) => {

  const cleanEmail =
    email.trim().toLowerCase()

  if (!cleanEmail) {
    throw new Error('กรุณากรอกอีเมล')
  }

  if (!password) {
    throw new Error('กรุณากรอกรหัสผ่าน')
  }

  const {
    data: authData,
    error: authError
  } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password
  })

  if (authError) {
    console.error(
      'AUTH LOGIN ERROR:',
      authError
    )

    throw new Error(authError.message)
  }

  if (!authData.user) {
    throw new Error('ไม่พบข้อมูลผู้ใช้งาน')
  }

  // ==============================
  // ดึง Customer ด้วย Auth UUID
  // ==============================

  const {
    data: customerData,
    error: customerError
  } = await supabase
    .from('customer')
    .select(
      'customer_id, auth_user_id, name, email, phone'
    )
    .eq(
      'auth_user_id',
      authData.user.id
    )
    .maybeSingle()

  if (customerError) {
    console.error(
      'CUSTOMER SELECT ERROR:',
      customerError
    )

    throw new Error(
      `ไม่สามารถโหลดข้อมูลลูกค้าได้: ${customerError.message}`
    )
  }

  if (!customerData) {
    throw new Error(
      'เข้าสู่ระบบสำเร็จ แต่ไม่พบข้อมูล Customer'
    )
  }

  localStorage.setItem(
    'customer',
    JSON.stringify(customerData)
  )

  return {
    user: authData.user,
    customer: customerData,
    session: authData.session
  }
}


// ==============================
// Get Current Customer
// ==============================

export const getCurrentCustomer = async () => {

  const {
    data: sessionData,
    error: sessionError
  } = await supabase.auth.getSession()

  if (sessionError) {
    console.error(
      'GET SESSION ERROR:',
      sessionError
    )

    return null
  }

  const user =
    sessionData.session?.user

  if (!user) {
    localStorage.removeItem('customer')
    return null
  }

  // ==============================
  // ดึง Customer ด้วย Auth UUID
  // ==============================

  const {
    data: customerData,
    error: customerError
  } = await supabase
    .from('customer')
    .select(
      'customer_id, auth_user_id, name, email, phone'
    )
    .eq(
      'auth_user_id',
      user.id
    )
    .maybeSingle()

  if (customerError) {
    console.error(
      'GET CUSTOMER ERROR:',
      customerError
    )

    return null
  }

  if (!customerData) {
    console.warn(
      'ไม่พบ Customer ของ Auth User'
    )

    return null
  }

  localStorage.setItem(
    'customer',
    JSON.stringify(customerData)
  )

  return customerData
}


// ==============================
// Update Customer Profile
// ==============================

export const updateCustomerProfile = async (
  data: CustomerUpdateData
) => {

  const name =
    data.name.trim()

  const phone =
    data.phone.trim()

  if (!name) {
    throw new Error(
      'กรุณากรอกชื่อ-นามสกุล'
    )
  }

  if (!phone) {
    throw new Error(
      'กรุณากรอกเบอร์โทรศัพท์'
    )
  }

  // ==============================
  // ตรวจสอบ Session
  // ==============================

  const {
    data: sessionData,
    error: sessionError
  } = await supabase.auth.getSession()

  if (sessionError) {
    throw new Error(
      `ไม่สามารถตรวจสอบ Session ได้: ${sessionError.message}`
    )
  }

  const user =
    sessionData.session?.user

  if (!user) {
    throw new Error(
      'กรุณาเข้าสู่ระบบใหม่'
    )
  }

  // ==============================
  // Update ด้วย Auth UUID
  // ==============================

  const {
    data: updatedCustomer,
    error
  } = await supabase
    .from('customer')
    .update({
      name,
      phone
    })
    .eq(
      'auth_user_id',
      user.id
    )
    .select(
      'customer_id, auth_user_id, name, email, phone'
    )
    .single()

  if (error) {
    console.error(
      'UPDATE CUSTOMER ERROR:',
      error
    )

    throw new Error(
      `อัปเดตข้อมูลไม่สำเร็จ: ${error.message}`
    )
  }

  // ==============================
  // Update Local Storage
  // ==============================

  localStorage.setItem(
    'customer',
    JSON.stringify(updatedCustomer)
  )

  return updatedCustomer
}


// ==============================
// Update Customer Password
// ==============================

export const updateCustomerPassword = async (
  currentPassword: string,
  newPassword: string
) => {

  const oldPassword =
    currentPassword.trim()

  const password =
    newPassword.trim()

  if (!oldPassword) {
    throw new Error(
      'กรุณากรอกรหัสผ่านเดิม'
    )
  }

  if (!password) {
    throw new Error(
      'กรุณากรอกรหัสผ่านใหม่'
    )
  }

  if (password.length < 8) {
    throw new Error(
      'รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร'
    )
  }

  if (oldPassword === password) {
    throw new Error(
      'รหัสผ่านใหม่ต้องไม่เหมือนรหัสผ่านเดิม'
    )
  }

  // ==============================
  // ตรวจสอบ Session
  // ==============================

  const {
    data: sessionData,
    error: sessionError
  } = await supabase.auth.getSession()

  if (sessionError) {
    throw new Error(
      `ไม่สามารถตรวจสอบ Session ได้: ${sessionError.message}`
    )
  }

  const currentUser =
    sessionData.session?.user

  if (!currentUser) {
    throw new Error(
      'ไม่พบผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่'
    )
  }

  if (!currentUser.email) {
    throw new Error(
      'ไม่พบอีเมลของผู้ใช้งาน'
    )
  }

  // ==============================
  // ตรวจสอบ Password เดิม
  // ==============================

  const {
    error: loginError
  } = await supabase.auth.signInWithPassword({
    email: currentUser.email,
    password: oldPassword
  })

  if (loginError) {
    console.error(
      'VERIFY OLD PASSWORD ERROR:',
      loginError
    )

    throw new Error(
      'รหัสผ่านเดิมไม่ถูกต้อง'
    )
  }

  // ==============================
  // Update Password
  // ==============================

  const {
    error: updateError
  } = await supabase.auth.updateUser({
    password
  })

  if (updateError) {
    console.error(
      'UPDATE PASSWORD ERROR:',
      updateError
    )

    throw new Error(
      `เปลี่ยนรหัสผ่านไม่สำเร็จ: ${updateError.message}`
    )
  }

  return true
}


// ==============================
// Logout
// ==============================

export const logoutCustomer = async () => {

  const {
    error
  } = await supabase.auth.signOut()

  if (error) {
    throw new Error(
      error.message
    )
  }

  localStorage.removeItem(
    'customer'
  )
}


// ==============================
// Forgot Password
// ==============================

export const resetCustomerPassword = async (
  email: string
) => {

  const cleanEmail =
    email.trim().toLowerCase()

  if (!cleanEmail) {
    throw new Error(
      'กรุณากรอกอีเมล'
    )
  }

  const {
    error
  } =
    await supabase.auth.resetPasswordForEmail(
      cleanEmail,
      {
        redirectTo:
          `${window.location.origin}/reset-password`
      }
    )

  if (error) {
    console.error(
      'RESET PASSWORD ERROR:',
      error
    )

    throw new Error(
      error.message
    )
  }

  return true
}




// โครงสร้างข้อมูลตรงกับตาราง "vehicle" ใน Supabase
export interface Vehicle {
  vehicle_id: number
  brand: string
  model: string
  price: number
  registration_no: string
  engine_size: number | null
  vehicle_type: string | null
  status: string
  image: string | null
  explanation: string | null
}
 
/**
 * ดึงข้อมูลรถทั้งหมดจากตาราง vehicle
 */
export async function getVehicles(): Promise<Vehicle[]> {
  const { data, error } = await supabase
    .from('vehicle')
    .select('*')
    .order('vehicle_id', { ascending: true })
 
  if (error) {
    console.error('getVehicles error:', error.message)
    throw error
  }
 
  return data ?? []
}
 
/**
 * ดึงข้อมูลรถเฉพาะที่ว่างให้เช่า (status = 'available')
 */
export async function getAvailableVehicles(): Promise<Vehicle[]> {
  const { data, error } = await supabase
    .from('vehicle')
    .select('*')
    .eq('status', 'available')
    .order('vehicle_id', { ascending: true })
 
  if (error) {
    console.error('getAvailableVehicles error:', error.message)
    throw error
  }
 
  return data ?? []
}
 
/**
 * ดึงข้อมูลรถคันเดียวจาก vehicle_id
 */
export async function getVehicleById(vehicleId: number): Promise<Vehicle | null> {
  const { data, error } = await supabase
    .from('vehicle')
    .select('*')
    .eq('vehicle_id', vehicleId)
    .single()
 
  if (error) {
    console.error('getVehicleById error:', error.message)
    throw error
  }
 
  return data
}