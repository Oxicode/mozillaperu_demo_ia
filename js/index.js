var loading = '<div class="spinner-border text-success" role="status"><span class="sr-only">Loading...</span></div>';

var endpoints = {
    face: {
        'endpoint': 'https://mozillademo.cognitiveservices.azure.com/face/v1.0/detect',
        'key': '95b6d147a84146a783b5a2af1fc625a6'
    },
    vision: {
        'endpoint': 'https://eventoMozilla.cognitiveservices.azure.com/vision/v2.0/analyze',
        'key': '3942ab5d06084d9d914823fa9346f543'
    }
}
var colors = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'];

$(document).ready(function() {

    $('.demo-img').click(function(e) {
        e.preventDefault();

        let href = $(this).attr('href');
        $('#input-url')
            .val(href)
            .trigger('change');

    })

    $('#input-url').change(function() {
        $(this).prop('readonly', true);

        $('.image-upload-wrap').hide();
        $('.file-upload-image').attr('src', this.value);
        $('.file-upload-content').show();
        $('.image-title').html('-');

        $('#descripcion, #tags, #face').html(loading);

        ws_ia()
    })

    $('.image-upload-wrap').bind('dragover', function() {
        $('.image-upload-wrap').addClass('image-dropping');
    });

    $('.image-upload-wrap').bind('dragleave', function() {
        $('.image-upload-wrap').removeClass('image-dropping');
    });

    function ajax(api, params, cb) {
        let urlImg = $('#input-url').val();

        $.ajax({
            method: "post",
            url: endpoints[api].endpoint + params,
            data: JSON.stringify({ 'url': urlImg }),
            headers: {
                "Content-Type": 'application/json',
                "Ocp-Apim-Subscription-Key": endpoints[api].key
            },
            validateStatus: function(status) {
                return status < 500;
            },
        }).done(cb);
    }

    function ws_ia() {

        var param1 = '?language=es&returnFaceLandmarks=true&returnFaceAttributes=age,gender,headPose,facialHair,emotion,hair,makeup,accessories,blur,noise'

        var param2 = '?visualFeatures=Categories,Description,Color&details=&language=es'

        ajax('face', param1, function(data) {
            console.log({ data })

            let face_rectangle = '<div class="face-rectangle face-rectangle-f"></div>';
            $('.face-rectangle').remove();

            if (data.length) {
                let $parent = $('.file-upload-content')

                let rostro = data[0];

                let coordenadas = {
                    'width': (rostro.faceRectangle.width / $('#file-upload-image')[0].naturalWidth * 100) + '%',
                    'top': (rostro.faceRectangle.height / $parent.height() * 100) + '%',
                    'height': (rostro.faceRectangle.height / $parent.height() * 100) + '%',
                    'left': (rostro.faceRectangle.left / $('#file-upload-image')[0].naturalWidth * 100) + '%',
                }
                $(face_rectangle).css(coordenadas).appendTo($parent);

                let sentimientoMayor = _.max(rostro.faceAttributes.emotion);
                let keys = _.keys(rostro.faceAttributes.emotion);
                var vals = _.values(rostro.faceAttributes.emotion);

                let informacion = [];
                informacion[0] = 'Edad aproximada: ' + rostro.faceAttributes['age'] + ' años';
                informacion[1] = 'Genero: ' + rostro.faceAttributes['gender'];
                informacion[2] = 'Emoción: ' + keys[vals.indexOf(sentimientoMayor)]
                informacion[3] = 'Accessories: ' + (rostro.faceAttributes['accessories'].lenght ? 'Con accesorios' : 'Sin acccesorios')

                $('#face').html(informacion.join('<br>'));
            } else {
                $('#face').html('No he podido reconocer ningún rostro');
            }
        })

        ajax('vision', param2, function(data) {
            let captions = data.description.captions;

            if (captions.length) {
                let porcentaje = (captions[0].confidence * 100).toFixed(2);

                $('#descripcion').html(captions[0].text)
                $('#descripcion_score').html('Certeza: ' + porcentaje + '%')
            } else {
                $('#descripcion').html('Aún no puedo describir esta imágen 😥')
            }

            $('#tags').empty();

            $.each(data.description.tags, function(_i, e) {
                var color = colors[Math.floor(Math.random() * colors.length)];
                $('<span class="badge badge-' + color + '">' + e + '</span> ').appendTo('#tags')
            })
        });
    };

    $('#refresh').click(function() {
        window.location.href = window.location.href
    })
});