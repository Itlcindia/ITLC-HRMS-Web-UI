<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

if (['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true);

$amountInRupees = isset($input['amount']) ? floatval($input['amount']) : 1.0;
$amountInPaise = intval(round($amountInRupees * 100));
if ($amountInPaise < 100) {
    $amountInPaise = 100;
}

$currency = isset($input['currency']) && !empty($input['currency']) ? $input['currency'] : 'INR';
$receipt = 'rcpt_' . time() . '_' . rand(1000, 9999);

$keyId = 'rzp_live_Tb2olLw1YkeJRm';
$keySecret = 'giWCJ9bxC3NcUSfvQvr5dp2i';

$payload = json_encode([
    'amount' => $amountInPaise,
    'currency' => $currency,
    'receipt' => $receipt,
    'payment_capture' => 1,
    'notes' => [
        'company' => isset($input['companyName']) ? $input['companyName'] : 'ITLC Enterprise',
        'plan' => isset($input['planId']) ? $input['planId'] : 'standard'
    ]
]);

$ch = curl_init('https://api.razorpay.com/v1/orders');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_USERPWD, $keyId . ':' . $keySecret);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 15);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($httpCode >= 200 && $httpCode < 300 && $response) {
    $orderData = json_decode($response, true);
    echo json_encode([
        'success' => true,
        'order' => $orderData
    ]);
} else {
    http_response_code($httpCode > 0 ? $httpCode : 500);
    echo json_encode([
        'success' => false,
        'error' => $curlError ? $curlError : $response,
        'http_code' => $httpCode
    ]);
}
?>