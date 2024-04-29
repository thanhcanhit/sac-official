import Format from "../../util/format";
import { FaLongArrowAltRight } from "react-icons/fa";

type DiscountPriceProps = {
	price: number;
	discount: {
		type: "percent" | "fixed";
		value: number;
	};
};
function DiscountPrice({ price, discount }: DiscountPriceProps) {
	const discountAmount =
		discount.type === "percent"
			? (price * discount.value) / 100
			: discount.value;
	const displayPrice: number = price - discountAmount;
	return (
		<div>
			{discount.value > 0 && (
				<span className="absolute p-2 font-medium text-white bg-red-500 rounded-full right-2 text-md top-2">
					-
					{discount.type === "percent"
						? discount.value + "%"
						: Format.currency(discount.value)}
				</span>
			)}

			{discount.value > 0 && (
				<>
					<span className="font-normal font-semibold text-gray-500 line-through">
						{Format.currency(price)}
					</span>
					<FaLongArrowAltRight className="inline mx-2" />
				</>
			)}

			<span className=" font-display">{Format.currency(displayPrice)}</span>
		</div>
	);
}

export default DiscountPrice;