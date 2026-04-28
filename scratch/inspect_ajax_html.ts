import fetch from 'node-fetch';

async function run() {
  const AJAX_URL = 'https://centralfordpr.com/wp-admin/admin-ajax.php';
  const formData = new URLSearchParams();
  formData.append('action', 'get_inventory_results_v2');
  formData.append('allFilters[current_page]', '1');
  formData.append('allFilters[per_page]', '1');
  formData.append('allFilters[make]', '19'); // Ford
  formData.append('allFilters[condition]', 'New');

  const response = await fetch(AJAX_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    },
    body: formData.toString()
  });

  const data: any = await response.json();
  if (data && data.success && data.data && data.data.vehicles) {
    console.log('--- HTML del primer vehículo ---');
    console.log(data.data.vehicles.substring(0, 3000));
  } else {
    console.log('No se pudo obtener el HTML');
  }
}

run().catch(console.error);
