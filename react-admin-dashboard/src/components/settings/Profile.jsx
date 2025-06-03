import { User } from "lucide-react";
import SettingSection from "./SettingSection";

const Profile = () => {
	return (
		<SettingSection icon={User} title={"Hồ sơ"}>
			<div className='flex flex-col sm:flex-row items-center mb-6'>
				<img
					src='/public/me.jpg'
					alt='Profile'
					className='rounded-full w-20 h-20 object-cover mr-4'
				/>

				<div>
					<h3 className='text-lg font-semibold text-theme-text-primary'>Anh Đoàn</h3>
					<p className='text-theme-text-secondary'>anh@gmail.com</p>
				</div>
			</div>

			<button className='bg-theme-primary hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition duration-200 w-full sm:w-auto'>
				Chỉnh sửa
			</button>
		</SettingSection>
	);
};
export default Profile;
