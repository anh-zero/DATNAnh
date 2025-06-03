import { useState } from "react";
import SettingSection from "./SettingSection";
import { Bell } from "lucide-react";
import ToggleSwitch from "./ToggleSwitch";

const Notifications = () => {
	const [notifications, setNotifications] = useState({
		push: true,
		email: false,
		sms: true,
	});

	return (
		<SettingSection icon={Bell} title={"Thông báo"}>
			<ToggleSwitch
				label={"Chặn thông báo"}
				isOn={notifications.push}
				onToggle={() => setNotifications({ ...notifications, push: !notifications.push })}
			/>
			<ToggleSwitch
				label={"Qua email"}
				isOn={notifications.email}
				onToggle={() => setNotifications({ ...notifications, email: !notifications.email })}
			/>
			<ToggleSwitch
				label={"Qua SMS"}
				isOn={notifications.sms}
				onToggle={() => setNotifications({ ...notifications, sms: !notifications.sms })}
			/>
		</SettingSection>
	);
};
export default Notifications;
