(function($) {
    $(document).ready(function() {
        var statusField = $('#id_status');
        var parkingLotField = $('#id_parking_lot').closest('.form-row');
        var isResidentField = $('#id_is_resident');
        var residentField = $('#id_resident').closest('.form-row');

        // Function to toggle Parking Lot visibility
        function toggleParkingLotField() {
            if (statusField.val() === 'in') {
                parkingLotField.show();
            } else {
                parkingLotField.hide();
            }
        }


        function toggleResidentField() {
            if (isResidentField.is(':checked')) {
                residentField.show();
            } else {
                residentField.hide();
            }
        }


        statusField.change(toggleParkingLotField);
        isResidentField.change(toggleResidentField);


        toggleParkingLotField();
        toggleResidentField();
    });
})(django.jQuery);
