const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase URL or Service Role Key in environment variables.');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function main() {
  const userId = '34b6c23e-3818-4e73-8c67-779e06933d85';
  const email = 'admin@gmail.com';
  const password = 'Admin@123';

  console.log(`Checking/setting Supabase Auth user: ${email}...`);

  // Try to update user password
  const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
    userId,
    { password: password }
  );

  if (updateError) {
    console.log('User update error or user does not exist in Auth yet:', updateError.message);
    console.log('Attempting to create the user in Supabase Auth instead...');

    // Try to create the user in Supabase Auth with the specific ID and password
    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      id: userId,
      email: email,
      password: password,
      email_confirm: true,
    });

    if (createError) {
      console.error('Failed to create user in Supabase Auth:', createError.message);
      process.exit(1);
    } else {
      console.log('Successfully created user in Supabase Auth:', createData.user.email);
    }
  } else {
    console.log('Successfully updated password for existing user in Supabase Auth:', updateData.user.email);
  }

  console.log(`\n========================================`);
  console.log(`Login Credentials:`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log(`========================================`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
