
# VUE BUG:
## Doesn't work
selected_records.value = [];
## Work
selected_records.value.splice(0); 

# Browser cache
use router.back() will use browser cache

