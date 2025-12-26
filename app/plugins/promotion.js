
export default defineNuxtPlugin({
	parallel: true,
	async setup(nuxtApp) {
		// the next plugin will be executed immediately
		// console.log("plugin: promotion");

		class Promotion {
			all_conditions = new Map();
			operator = null;
			all_actions = new Map();
			cart_actions = {};
			catalog_actions = {};

			constructor() { }

			async applyOneCatalogRule(rule_id) {
				return await useApiFetch(
					"/admin/promotion/rule/catalog/apply/" + rule_id, {
					method: HTTP_METHOD.POST
				});
			}

			async applyOneCmsBlock(rule_id) {
				return await useApiFetch(
					"/admin/block/cms_block/catalog/apply/" + rule_id, {
					method: HTTP_METHOD.POST
				});
			}

			async unApplyCmsBlock(rule_id) {
				return await useApiFetch(
					"/admin/block/cms_block/catalog/un-apply/" + rule_id, {
					method: HTTP_METHOD.POST
				});
			}
			async unApplyOneCatalogRule(rule_id) {
				return await useApiFetch(
					"/admin/promotion/rule/catalog/un-apply/" + rule_id, {
					method: HTTP_METHOD.POST
				});
			}

			async applyAllCatalogRules() {
				return await useApiFetch(
					"/admin/promotion/apply/", {
					method: HTTP_METHOD.POST
				});
			}

			async applyCartRule(rule_id) {
				return await useApiFetch(
					"/admin/promotion/rule/cart/apply/" + rule_id, {
					method: HTTP_METHOD.POST
				});
			}

			async getFrontendData() {
				return await useApiFetch(
					"/admin/promotion/rule/frontend-data", {
					method: HTTP_METHOD.GET
				});
			}

			async getOperatorCodesByType(type) {
				return await useApiFetch(
					"/admin/promotion/rule/operator/type/" + type, {
					method: HTTP_METHOD.GET
				});
			}

			async getAttrData(condition_code, attr_code) {
				let url = "/admin/promotion/rule/attr/data";
				url += "?condition_code=" + condition_code;
				url += "&attr_code=" + attr_code;

				return await useApiFetch(url, {
					method: HTTP_METHOD.GET
				});
			}

			async load() {
				const result_data = await this.getFrontendData();
				if (!result_data.result) {
					return;
				}

				const data = result_data.data;
				const conditions = data.conditions;
				const operators = data.operators;
				const actions = data.actions;
				this.cart_actions = data.cart_actions;
				this.catalog_actions = data.catalog_actions;

				// Load conditions
				for (let condition_code in conditions) {
					const condition_data = conditions[condition_code];
					switch (condition_code) {
						case PromotionCombination.CODE:
							condition_data.class_type = PromotionCombination;
							break;
						case PromotionConditionProductAttribute.CODE:
							condition_data.class_type = PromotionConditionProductAttribute;
							break;
						case PromotionConditionProductSubselection.CODE:
							condition_data.class_type = PromotionConditionProductSubselection;
							break;
						case PromotionConditionConfigurable.CODE:
							condition_data.class_type = PromotionConditionConfigurable;
							break;
						case PromotionConditionVariant.CODE:
							condition_data.class_type = PromotionConditionVariant;
							break;
						case PromotionConditionCustomer.CODE:
							condition_data.class_type = PromotionConditionCustomer;
							break;
						case PromotionConditionQuote.CODE:
							condition_data.class_type = PromotionConditionQuote;
							break;
						case PromotionConditionShippingAddress.CODE:
							condition_data.class_type = PromotionConditionShippingAddress;
							break;
						case PromotionConditionCatalogProduct.CODE:
							condition_data.class_type = PromotionConditionCatalogProduct;
							break;
					}

					this.all_conditions.set(condition_code, condition_data);
				}

				// Load operator
				this.operator = new Operator(operators);

				// load actions
				for (let action_code in actions) {
					const action_data = actions[action_code];
					switch (action_code) {
						case PromotionActionCartDiscountAmount.CODE:
							action_data.class_type = PromotionActionCartDiscountAmount;
							break;
						case PromotionActionCartDiscountPercent.CODE:
							action_data.class_type = PromotionActionCartDiscountPercent;
							break;
						case PromotionActionCartGiftPerItem.CODE:
							action_data.class_type = PromotionActionCartGiftPerItem;
							break;
						case PromotionActionCartGiftWholeCart.CODE:
							action_data.class_type = PromotionActionCartGiftWholeCart;
							break;
						case PromotionActionCartInvoiceDiscountAmount.CODE:
							action_data.class_type = PromotionActionCartInvoiceDiscountAmount;
							break;
						case PromotionActionCartInvoiceDiscountPercent.CODE:
							action_data.class_type = PromotionActionCartInvoiceDiscountPercent;
							break;
						case PromotionActionCatalogDiscountAmount.CODE:
							action_data.class_type = PromotionActionCatalogDiscountAmount;
							break;
						case PromotionActionCatalogDiscountPercent.CODE:
							action_data.class_type = PromotionActionCatalogDiscountPercent;
							break;
					}

					this.all_actions.set(action_code, action_data);
				}

			}

			instantiateConditionByCode(code) {
				const condition_data = this.all_conditions.get(code);
				const condition = new condition_data.class_type(condition_data);
				return condition;
			}

			instantiateActionByCode(code) {
				const action_data = this.all_actions.get(code);
				const action = new action_data.class_type(action_data, this);
				return action;
			}

			async getOperatorsByType(type) {
				const result_data = await this.getOperatorCodesByType(type);
				if (!result_data.result) {
					return {};
				}

				return result_data.operators;
			}

			getActionOptions(rule_type) {
				let action_options = [{
					title: "Please select an action...",
					value: ""
				}];

				for (const [code, value] of this.all_actions.entries()) {
					switch (rule_type) {
						case PROMOTION_RULE_TYPE.CART:
							if (this.cart_actions[value.code]) {
								action_options.push({
									title: value.name,
									value: value.code,
									data: value
								});
							}
							break;
						case PROMOTION_RULE_TYPE.CATALOG:
							if (this.catalog_actions[value.code]) {
								action_options.push({
									title: value.name,
									value: value.code,
									data: value
								});
							}
							break;
					}
				}

				return action_options;
			}

			async duplicatePromotion(rule_id) {
				const url = "/admin/promotion/rule/duplicate?rule_id=" + rule_id;
				return await useApiFetch(url, {
					method: HTTP_METHOD.POST
				});
			}
			async duplicateCmsBlock(block_id) {
				const url = "/admin/block/cms_block/duplicate?block_id=" + block_id;
				return await useApiFetch(url, {
					method: HTTP_METHOD.POST
				});
			}

			async generateCoupons(
				rule_id, coupon_qty, coupon_length,
				code_prefix, code_suffix, code_format
			) {
				const url = "/admin/promotion/coupon/generate";
				return await useApiFetch(url, {
					method: HTTP_METHOD.POST,
					body: {
						rule_id: rule_id,
						coupon_qty: coupon_qty,
						coupon_length: coupon_length,
						code_prefix: code_prefix,
						code_suffix: code_suffix,
						code_format: code_format
					}
				});
			}

			async generateCoupons(
				rule_id, coupon_qty, coupon_length,
				code_prefix, code_suffix, code_format
			) {
				const url = "/admin/promotion/coupon/generate";
				return await useApiFetch(url, {
					method: HTTP_METHOD.POST,
					body: {
						rule_id: rule_id,
						coupon_qty: coupon_qty,
						coupon_length: coupon_length,
						code_prefix: code_prefix,
						code_suffix: code_suffix,
						code_format: code_format
					}
				});
			}

			async deleteAllCoupons(rule_id) {
				const url = "/admin/promotion/coupon/delete/all";
				return await useApiFetch(url, {
					method: HTTP_METHOD.DELETE,
					body: {
						rule_id: rule_id,
					}
				});
			}

			async deleteSelectedCoupons(coupon_ids) {
				const url = "/admin/promotion/coupon/delete/selected";
				return await useApiFetch(url, {
					method: HTTP_METHOD.DELETE,
					body: {
						coupon_ids: coupon_ids,
					}
				});
			}

		}

		const promotion = new Promotion();

		return {
			provide: {
				promotion: promotion,
			},
		};
	}
});
