import { FcAndroidOs } from "react-icons/fc";
import { MdOutlineFileDownload } from "react-icons/md";
import appIconSrc from "../../assets/imgs/product/app_icon.png";
import { useEffect, useState } from "react";
import { Image, Spin } from "antd";
import { motion } from "framer-motion";
import Each from "../../util/Each";
import appImgs from "../../assets/imgs/appImgs";
import useLang from "../../hooks/useLang";

const appInfo: {
	releaseDate: string;
	version: string;
	size: string;
	apk: string;
} = {
	releaseDate: "17/01/2024",
	version: "1.1",
	size: "45mb",
	apk: "https://sacvietnam.github.io/apk/SAC%20Remote%201.1.apk",
};

const Download = () => {
	const [isClicked, setClicked] = useState<boolean>(false);
	const { getContentCurrentLang } = useLang();

	useEffect(() => {
		let to = 0;
		if (isClicked) {
			to = setTimeout(() => {
				setClicked(false);
			}, 1000);
		}

		return () => {
			clearTimeout(to);
		};
	}, [isClicked]);
	return (
		<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
			<div className="max-w-screen-xl px-2 py-4 mx-auto">
				<div className="flex flex-col gap-8 md:gap-16 md:flex-row">
					<div className="grid place-items-center">
						<img
							className="w-1/2 rounded-lg md:w-full"
							src={appIconSrc}
							alt="App icon"
						/>
					</div>
					<div className="flex flex-col gap-2 text-center md:text-left">
						<h2 className="text-5xl font-display text-primary">SAC Remote</h2>
						<p className="text-justify text-secondary">
							{getContentCurrentLang({
								en: "The application allows viewing temperature, humidity, and battery information sent from the SAC device. You can also set the fan speed and automatically turn the device on and off.",
								vi: "Ứng dụng cho phép theo dõi các thông tin nhiệt độ, độ ẩm, lượng pin và các thông tin khác từ thiết bị SAC. Bạn cũng có thể thiết lập tốc độ quạt và các tính năng tự động khác",
							})}
						</p>
						<div className="flex flex-col items-center gap-2 md:items-start">
							<p>
								{getContentCurrentLang({
									en: "Available in:",
									vi: "Hiện có trên:",
								})}
							</p>{" "}
							<FcAndroidOs className="text-5xl" />
						</div>
						<p>
							{getContentCurrentLang({ en: "Version", vi: "Phiên bản" })}:{" "}
							{appInfo.version}
						</p>
						<p>
							{getContentCurrentLang({
								en: "Release Date",
								vi: "Ngày phát hành",
							})}
							: {appInfo.releaseDate}
						</p>
						<p>
							{getContentCurrentLang({ en: "Size", vi: "Kích thước" })}:{" "}
							{appInfo.size}
						</p>
						{isClicked ? (
							<button
								disabled
								className="flex items-center gap-2 px-4 py-2 mx-auto transition-all bg-white rounded-md text-text md:mx-0 drop-shadow-lg w-fit"
							>
								<Spin />{" "}
								{getContentCurrentLang({
									en: "Downloading...",
									vi: "Đang tải xuống...",
								})}
							</button>
						) : (
							<a
								onClick={() => setClicked(true)}
								href="/apk/SAC Remote 1.1.apk"
								target="_blank"
								className="mx-auto md:mx-0 w-fit"
							>
								<button className="flex items-center gap-2 px-4 py-2 mx-auto text-white transition-all rounded-md md:mx-0 bg-primary drop-shadow-lg w-fit hover:bg-light_primary hover:scale-105 active:scale-95">
									<MdOutlineFileDownload className="text-xl text-white" />
									{getContentCurrentLang({
										en: "Download for Android",
										vi: "Tải xuống cho Android",
									})}
								</button>
							</a>
						)}
					</div>
				</div>
				<div className="w-full mt-8">
					<h3 className="mb-2 text-xl">
						{getContentCurrentLang({
							en: "Some images of the software:",
							vi: "Vài hình ảnh về ứng dụng:",
						})}
					</h3>
					<Image.PreviewGroup items={appImgs}>
						<div className="flex gap-2 overflow-x-auto flex-nowrap snap-mandatory snap-x">
							<Each
								of={appImgs}
								render={(path, index) => (
									<motion.div
										initial={{ x: -100, opacity: 0 }}
										animate={{ x: 0, opacity: 1 }}
										transition={{ delay: 0.2 * index + 0.1, duration: 0.2 }}
									>
										<Image
											key={path}
											src={path}
											width={200}
											height={400}
											className="object-contain select-none min-w-[200px] snap-center"
										/>
									</motion.div>
								)}
							/>
						</div>
					</Image.PreviewGroup>
				</div>
			</div>
		</motion.div>
	);
};

export default Download;
