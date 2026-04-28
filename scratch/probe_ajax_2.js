async function probe() {
  const url = 'https://centralfordpr.com/wp-admin/admin-ajax.php';
  const formData = new URLSearchParams();
  formData.append('action', 'get_inventory_results_v2');
  formData.append('allFilters[current_page]', '1');
  formData.append('allFilters[per_page]', '24');
  formData.append('allFilters[sort]', 'updated_at');
  formData.append('allFilters[sort_direction]', 'desc');
  formData.append('allFilters[make]', '19');
  formData.append('allFilters[condition]', 'New');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': 'https://centralfordpr.com/inventario-nuevos/',
      'Origin': 'https://centralfordpr.com',
      'X-Requested-With': 'XMLHttpRequest',
      'Cookie': 'cookieadmin_consent={"accept":"true"}'
    },
    body: formData.toString()
  });

  const data = await response.json();
  console.log('Success:', data.success);
  console.log('Total:', data.data?.total);
  if (data.data?.vehicles) {
    console.log('Vehicles HTML Length:', data.data.vehicles.length);
  } else {
    console.log('No vehicles in data');
  }
}

probe().catch(console.error);
