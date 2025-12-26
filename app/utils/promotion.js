
/**
 * PromotionCondition
 */
export class PromotionCondition {
	static CODE = "";

	id = -1;
	code = "";
	type = "";
	name = "";
	children = [];

	constructor(data) {
		this.id = data.id || -1;
		this.code = data.code;
		this.name = data.name;
		this.type = data.type;

		this.children = [];
		if (data.children) {
			let index = 0;
			for (let i in data.children) {
				const child_data = data.children[i];
				child_data.id = (index + 1);
				const condition = PromotionCondition.newConditionByCode(child_data.code, child_data);
				this.children.push(condition);
			}
		}
	}

	toJson() {
		let children_json = [];
		for (let i in this.children) {
			const child = this.children[i];
			children_json.push(child.toJson());
		}

		return {
			"id": this.id,
			"code": this.code,
			"type": this.type,
			"name": this.name,
			"children": children_json,
		};
	}

	static newConditionByCode(code, data) {
		switch (code) {
			case PromotionCombination.CODE:
				return new PromotionCombination(data);
			case PromotionConditionProductAttribute.CODE:
				return new PromotionConditionProductAttribute(data);
			case PromotionConditionProductSubselection.CODE:
				return new PromotionConditionProductSubselection(data);
			case PromotionConditionConfigurable.CODE:
				return new PromotionConditionConfigurable(data);
			case PromotionConditionVariant.CODE:
				return new PromotionConditionVariant(data);
			case PromotionConditionCustomer.CODE:
				return new PromotionConditionCustomer(data);
			case PromotionConditionQuote.CODE:
				return new PromotionConditionQuote(data);
			case PromotionConditionShippingAddress.CODE:
				return new PromotionConditionShippingAddress(data);
			case PromotionConditionCatalogProduct.CODE:
				return new PromotionConditionCatalogProduct(data);
		}
	}
}

export class Operator {
	operators = {};

	constructor(operators) {
		this.operators = operators;
	}
}

// Cart Conditions
export class PromotionCombination extends PromotionCondition {
	static CODE = "combination";

	aggregator = "";
	value = "";

	constructor(data) {
		super(data);

		this.aggregator = data.aggregator;
		this.value = data.value;
	}

	toJson() {
		const parent_json = super.toJson();

		return {
			...parent_json,
			"aggregator": this.aggregator,
			"value": this.value,
		}
	}
}

export const PROMOTION_RULE_TYPE = {
	CART: "cart_rule",
	CATALOG: "catalog_rule",
}

export class PromotionAttribute extends PromotionCondition {
	attribute_code = null;
	operator = null;
	input_value = null;
	input_raw = null;
	input_type = "";

	attributes = [];

	constructor(data) {
		super(data);

		this.attribute_code = data.attribute_code;
		this.operator = data.operator;
		this.input_value = data.input_value;
		this.input_raw = data.input_raw;
		this.input_type = data.input_type;
	}

	toJson() {
		const parent_json = super.toJson();

		return {
			...parent_json,
			"attribute_code": this.attribute_code,
			"operator": this.operator,
			"input_value": this.input_value,
			"input_raw": this.input_raw,
			"input_type": this.input_type,
		}
	}
}

export class PromotionConditionCustomer extends PromotionAttribute {
	static CODE = "customer";
}

export class PromotionConditionQuote extends PromotionAttribute {
	static CODE = "quote";
}

export class PromotionConditionShippingAddress extends PromotionAttribute {
	static CODE = "shipping_address";
}

export class PromotionConditionProductAttribute extends PromotionCondition {
	static CODE = "product_attribute";

	aggregator = "";
	action = "";

	constructor(data) {
		super(data);

		this.aggregator = data.aggregator;
		this.action = data.action;
	}

	toJson() {
		const parent_json = super.toJson();

		return {
			...parent_json,
			"aggregator": this.aggregator,
			"action": this.action,
		}
	}
}

export class PromotionConditionProductSubselection extends PromotionCondition {
	static CODE = "product_subselection";

	total_type = "";
	operator = "";
	total_value = "";
	aggregator = "";

	constructor(data) {
		super(data);

		this.total_type = data.total_type;
		this.operator = data.operator;
		this.total_value = data.total_value;
		this.aggregator = data.aggregator;
	}

	toJson() {
		const parent_json = super.toJson();

		return {
			...parent_json,
			"total_type": this.total_type,
			"operator": this.operator,
			"total_value": this.total_value,
			"aggregator": this.aggregator,
		}
	}
}
export class PromotionConditionConfigurable extends PromotionAttribute {
	static CODE = "product_configurable";
}

export class PromotionConditionVariant extends PromotionAttribute {
	static CODE = "product_variant";
}

// Catalog Conditions
export class PromotionConditionCatalogProduct extends PromotionAttribute {
	static CODE = "catalog_product";
}

/**
 * Promotion Action
 */
export class PromotionAction {
	static CODE = "";

	id = -1;
	code = "";
	type = "";
	name = "";
	trigger_id = 1;
	max_discount_amount = 0.0;
	max_qty = 0;
	calculation_discount_type = "";
	calculation_sort_type = "";
	apply_condition = null;
	apply_to_quote = false;
	apply_once_per_quote = false;
	apply_once_per_rule = false;

	constructor(data, $promotion) {
		this.id = data.id || -1;
		this.code = data.code;
		this.type = data.type;
		this.name = data.name;
		this.trigger_id = parseInt(data.trigger_id);
		this.max_discount_amount = data.max_discount_amount;
		this.max_qty = data.max_qty;

		this.calculation_discount_type = data.calculation_discount_type;
		this.calculation_sort_type = data.calculation_sort_type;
		
		// Constant data
		const action_data = $promotion.all_actions.get(this.code);
		if (action_data) {
			this.apply_to_quote = action_data.apply_to_quote;
			this.apply_once_per_quote = action_data.apply_once_per_quote;
			this.apply_once_per_rule = action_data.apply_once_per_rule;
		}

		// TODO: Convert Json to Condition
		if (data.apply_condition_json) {
			this.apply_condition = new PromotionCombination(data.apply_condition_json);
		} else {
			this.apply_condition = $promotion.instantiateConditionByCode(PromotionCombination.CODE);
		}
	}

	toJson() {
		// TODO: Convert Condition to JSON
		let apply_condition_json = [];
		if (this.apply_condition) {
			apply_condition_json = this.apply_condition.toJson();
		}

		return {
			"id": this.id,
			"code": this.code,
			"type": this.type,
			"name": this.name,
			"trigger_id": parseInt(this.trigger_id),
			"max_discount_amount": this.max_discount_amount,
			"max_qty": this.max_qty,
			"calculation_discount_type": this.calculation_discount_type,
			"calculation_sort_type": this.calculation_sort_type,
			"apply_condition_json": apply_condition_json,
		};
	}

	static newActionByCode(code, data, $promotion) {
		switch (code) {
			case PromotionActionCartDiscountAmount.CODE:
				return new PromotionActionCartDiscountAmount(data, $promotion);
			case PromotionActionCartDiscountPercent.CODE:
				return new PromotionActionCartDiscountPercent(data, $promotion);
			case PromotionActionCartGiftPerItem.CODE:
				return new PromotionActionCartGiftPerItem(data, $promotion);
			case PromotionActionCartGiftWholeCart.CODE:
				return new PromotionActionCartGiftWholeCart(data, $promotion);
			case PromotionActionCartInvoiceDiscountAmount.CODE:
				return new PromotionActionCartInvoiceDiscountAmount(data, $promotion);
			case PromotionActionCartInvoiceDiscountPercent.CODE:
				return new PromotionActionCartInvoiceDiscountPercent(data, $promotion);
			case PromotionActionCatalogDiscountAmount.CODE:
				return new PromotionActionCatalogDiscountAmount(data, $promotion);
			case PromotionActionCatalogDiscountPercent.CODE:
				return new PromotionActionCatalogDiscountPercent(data, $promotion);
		}
	}

}

export class PromotionActionCartGift extends PromotionAction {
	default_combo_id = -1;
	combo_list = [];

	constructor(data, $promotion) {
		super(data, $promotion);

		// Convert Json to Combo List
		this.combo_list = [];
		this.default_combo_id = data.default_combo_id;
		const combo_data_list = data.combo_list || [];
		for (let i in combo_data_list) {
			const combo_data = combo_data_list[i];
			const combo = new PromotionalItemCombo(combo_data);
			this.combo_list.push(combo);
		}
	}

	toJson() {
		const parent_json = super.toJson();
		const combo_list_json = JSON.parse(JSON.stringify(this.combo_list));
		return {
			...parent_json,
			combo_list: combo_list_json,
			default_combo_id: this.default_combo_id
		}
	}
}

export class PromotionActionCartDiscountAmount extends PromotionAction {
	static CODE = "cart_discount_amount";

	discount_amount = 0;

	constructor(data, $promotion) {
		super(data, $promotion);

		this.discount_amount = data.discount_amount;
	}

	toJson() {
		const parent_json = super.toJson();
		return {
			...parent_json,
			discount_amount: this.discount_amount,
		}
	}
}

export class PromotionActionCartDiscountPercent extends PromotionAction {
	static CODE = "cart_discount_percent";

	discount_percent = 0;

	constructor(data, $promotion) {
		super(data, $promotion);

		this.discount_percent = data.discount_percent;
	}

	toJson() {
		const parent_json = super.toJson();
		return {
			...parent_json,
			discount_percent: this.discount_percent,
		}
	}
}

export class PromotionActionCartGiftPerItem extends PromotionActionCartGift {
	static CODE = "cart_gift_per_item";
}

export class PromotionActionCartGiftWholeCart extends PromotionActionCartGift {
	static CODE = "cart_gift_whole_cart";
}

export class PromotionActionCartInvoiceDiscountAmount extends PromotionAction {
	static CODE = "cart_invoice_discount_amount";

	discount_amount = 0;

	constructor(data, $promotion) {
		super(data, $promotion);

		this.discount_amount = data.discount_amount;
	}

	toJson() {
		const parent_json = super.toJson();
		return {
			...parent_json,
			discount_amount: this.discount_amount,
		}
	}
}

export class PromotionActionCartInvoiceDiscountPercent extends PromotionAction {
	static CODE = "cart_invoice_discount_percent";

	discount_percent = 0;

	constructor(data, $promotion) {
		super(data, $promotion);

		this.discount_percent = data.discount_percent;
	}

	toJson() {
		const parent_json = super.toJson();
		return {
			...parent_json,
			discount_percent: this.discount_percent,
		}
	}
}

export class PromotionActionCatalogDiscountAmount extends PromotionAction {
	static CODE = "catalog_discount_amount";

	discount_amount = 0;

	constructor(data, $promotion) {
		super(data, $promotion);

		this.discount_amount = data.discount_amount;
	}

	toJson() {
		const parent_json = super.toJson();
		return {
			...parent_json,
			discount_amount: this.discount_amount,
		}
	}
}

export class PromotionActionCatalogDiscountPercent extends PromotionAction {
	static CODE = "catalog_discount_percent";

	discount_percent = 0;

	constructor(data, $promotion) {
		super(data, $promotion);

		this.discount_percent = data.discount_percent;
	}

	toJson() {
		const parent_json = super.toJson();
		return {
			...parent_json,
			discount_percent: this.discount_percent,
		}
	}
}

export class PromotionalItemCombo {
	id = -1;
	action_id = -1;
	items = [];

	constructor(data) {
		this.id = data.id || -1;
		this.action_id = data.action_id || -1;

		// Convert Json to Items
		this.items = [];
		const items_data = data.items || [];
		for (let i in items_data) {
			const item_data = items_data[i];
			const item = new PromotionalItem(item_data);
			this.items.push(item);
		}
	}
}

export class PromotionalItem {
	id = -1;
	item_no = "";
	variant_code = "";
	configurable_id = -1;
	configurable_name = "";
	variant_id = -1;
	variant_name = "";
	qty = 0;
	original_price = 0;
	discount_percent = 0;
	final_price = 0;

	constructor(data) {
		this.id = data.id;
		this.item_no = data.item_no;
		this.variant_code = data.variant_code;
		this.configurable_id = data.configurable_id;
		this.configurable_name = data.configurable_name;
		this.variant_id = data.variant_id;
		this.variant_name = data.variant_name;
		this.qty = data.qty;
		this.original_price = data.original_price;
		this.discount_percent = data.discount_percent;
		this.final_price = data.final_price;
	}
}
