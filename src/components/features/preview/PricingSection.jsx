import {useEditorStore} from "../../../store.js";
import {useShallow} from "zustand/react/shallow";

const PricingSection = () => {
	const price = useEditorStore(useShallow(state => state.getValue('price')));
	if (!price) return null;

	return (
		<section>
			<div className="px-4 sm:px-0">
				<h1 className="text-base font-semibold leading-6 text-gray-900" id="price">Price</h1>
				<p className="text-sm text-gray-500">This section covers pricing when you bill your customer for using
					this data product.</p>
			</div>
			<div className="mt-2 overflow-hidden shadow sm:rounded-lg bg-white">
				<div className="px-4 py-4 sm:px-6">
					<dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-3">
						{price.priceAmount && (
							<div className="sm:col-span-1">
								<dt className="text-sm font-medium text-gray-500">Price Amount</dt>
								<dd className="mt-1 text-sm text-gray-900">{price.priceAmount}</dd>
							</div>
						)}

						{price.priceCurrency && (
							<div className="sm:col-span-1">
								<dt className="text-sm font-medium text-gray-500">Price Currency</dt>
								<dd className="mt-1 text-sm text-gray-900">{price.priceCurrency}</dd>
							</div>
						)}

						{price.priceUnit && (
							<div className="sm:col-span-1">
								<dt className="text-sm font-medium text-gray-500">Price Unit</dt>
								<dd className="mt-1 text-sm text-gray-900">{price.priceUnit}</dd>
							</div>
						)}
					</dl>
				</div>
			</div>
		</section>
	);
};

PricingSection.displayName = 'PricingSection';

export default PricingSection;
