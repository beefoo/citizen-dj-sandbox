// Utility functions

(function() {
  window.Util = {};

  Util.listToString = function(arr){
    var arrLen = arr.length;
    if (arrLen < 1) return "Unknown";
    if (arrLen < 2) return arr[0];
    if (arrLen < 3) return arr.join(' and ');

    var string = '';
    _.each(arr, function(value, i){
      if (i===arrLen-1) string += value;
      else if (i===arrLen-2) string += (value + ', and ');
      else string += (value + ', ');
    });
    return string;
  };

  Util.mapVars = function(obj, map, reverse){
    if (reverse===true) {
      map = _.invert(map);
    }
    _.each(obj, function(value, key){
      if (_.has(map, key)) {
        obj[map[key]] = value;
        obj = _.omit(obj, key);
      }
    });
    return obj;
  };

  Util.queryParams = function(){
    if (location.search.length) {
      var search = location.search.substring(1);
      return JSON.parse('{"' + search.replace(/&/g, '","').replace(/=/g,'":"') + '"}', function(key, value) { return key===""?value:decodeURIComponent(value) });
    }
    return {};
  };

  Util.scrollTo = function(el, offset){
    offset = offset || 0;
    // $(el)[0].scrollIntoView();

    $([document.documentElement, document.body]).animate({
        scrollTop: $(el).offset().top + offset
    }, 1000);
  };

  Util.timeToString = function(dt){
    dt = dt || new Date();
    var date = dt.getFullYear()+'-'+(dt.getMonth()+1)+'-' + dt.getDate();
    var time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();
    var dateTime = date+' '+time;
    return dateTime;
  };

  Util.uniqueString = function(prefix){
    prefix = prefix || '';
    var dt = new Date().getTime();
    return ''+prefix+dt;
  };

})();


(function() {
  window.MathUtil = {};

  MathUtil.ceilToNearest = function(value, nearest) {
    return Math.ceil(value / nearest) * nearest;
  };

  MathUtil.clamp = function(value, min, max) {
    value = Math.min(value, max);
    value = Math.max(value, min);
    return value;
  };

  MathUtil.ease = function(n){
    return (Math.sin((n+1.5)*Math.PI)+1.0) / 2.0;
  };

  MathUtil.floorToNearest = function(value, nearest) {
    return Math.floor(value / nearest) * nearest;
  };

  MathUtil.lerp = function(a, b, percent) {
    return (1.0*b - a) * percent + a;
  };

  MathUtil.mod = function(n, m) {
    return ((n % m) + m) % m;
  }

  MathUtil.norm = function(value, a, b){
    var denom = (b - a);
    if (denom > 0 || denom < 0) {
      return (1.0 * value - a) / denom;
    } else {
      return 0;
    }
  };

  MathUtil.pad = function(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
  };

  MathUtil.round = function(value, precision) {
    return +value.toFixed(precision);
  };

  MathUtil.roundToNearest = function(value, nearest) {
    return Math.round(value / nearest) * nearest;
  };

  MathUtil.scaleAroundAnchor = function(originalValue, scaleAmount, anchor) {
    var distance = originalValue - anchor;
    var sdistance = distance * scaleAmount;
    return (anchor + sdistance);
  };

  MathUtil.secondsToString = function(seconds, precision){
    precision = precision || 0;
    if (!seconds || seconds <= 0) return "0:00";
    var d = new Date(null);
    d.setSeconds(seconds);
    var start = 11;
    var len = 8;
    if (seconds < 600) {
      start = 15;
      len = 4;
    } else if (seconds < 3600) {
      start = 14;
      len = 5;
    }
    var timeStr = d.toISOString().substr(start, len);
    if (precision > 0) timeStr += (seconds % 1.0).toFixed(precision).substr(1);
    return timeStr;
  };

  MathUtil.within = function(num, min, max) {
    if (num < min) return false;
    if (num > max) return false;
    return true;
  };

  MathUtil.wrap = function(num, min, max) {
    if (num >= min && num <= max) return num;
    else if (num < min) return max;
    else return min;
    // var delta = max - min;
    // if (delta < 1) return 0;
    // return ((num-min) % delta) + min;
  };

})();


(function() {
  window.AudioUtils = {};

  // https://github.com/Jam3/audiobuffer-to-wav
  function audioBufferToWav(buffer, opt) {
    opt = opt || {}

    var numChannels = buffer.numberOfChannels
    var sampleRate = buffer.sampleRate
    var format = opt.float32 ? 3 : 1
    var bitDepth = format === 3 ? 32 : 16

    var result
    if (numChannels === 2) {
      result = interleave(buffer.getChannelData(0), buffer.getChannelData(1))
    } else {
      result = buffer.getChannelData(0)
    }

    return encodeWAV(result, format, sampleRate, numChannels, bitDepth)
  }

  function encodeWAV (samples, format, sampleRate, numChannels, bitDepth) {
    var bytesPerSample = bitDepth / 8
    var blockAlign = numChannels * bytesPerSample

    var buffer = new ArrayBuffer(44 + samples.length * bytesPerSample)
    var view = new DataView(buffer)

    /* RIFF identifier */
    writeString(view, 0, 'RIFF')
    /* RIFF chunk length */
    view.setUint32(4, 36 + samples.length * bytesPerSample, true)
    /* RIFF type */
    writeString(view, 8, 'WAVE')
    /* format chunk identifier */
    writeString(view, 12, 'fmt ')
    /* format chunk length */
    view.setUint32(16, 16, true)
    /* sample format (raw) */
    view.setUint16(20, format, true)
    /* channel count */
    view.setUint16(22, numChannels, true)
    /* sample rate */
    view.setUint32(24, sampleRate, true)
    /* byte rate (sample rate * block align) */
    view.setUint32(28, sampleRate * blockAlign, true)
    /* block align (channel count * bytes per sample) */
    view.setUint16(32, blockAlign, true)
    /* bits per sample */
    view.setUint16(34, bitDepth, true)
    /* data chunk identifier */
    writeString(view, 36, 'data')
    /* data chunk length */
    view.setUint32(40, samples.length * bytesPerSample, true)
    if (format === 1) { // Raw PCM
      floatTo16BitPCM(view, 44, samples)
    } else {
      writeFloat32(view, 44, samples)
    }

    return buffer
  }

  function interleave (inputL, inputR) {
    var length = inputL.length + inputR.length
    var result = new Float32Array(length)

    var index = 0
    var inputIndex = 0

    while (index < length) {
      result[index++] = inputL[inputIndex]
      result[index++] = inputR[inputIndex]
      inputIndex++
    }
    return result
  }

  function writeFloat32 (output, offset, input) {
    for (var i = 0; i < input.length; i++, offset += 4) {
      output.setFloat32(offset, input[i], true)
    }
  }

  function floatTo16BitPCM (output, offset, input) {
    for (var i = 0; i < input.length; i++, offset += 2) {
      var s = Math.max(-1, Math.min(1, input[i]))
      output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true)
    }
  }

  function writeString (view, offset, string) {
    for (var i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i))
    }
  }

  AudioUtils.audioBufferToWavfile = function(buffer, filename){
    var wav = audioBufferToWav(buffer)
    var blob = new window.Blob([ new DataView(wav) ], {
      type: 'audio/wav'
    });

    AudioUtils.downloadBlob(blob, filename);
  };

  AudioUtils.downloadBlob = function(blob, filename){
    filename = filename || 'citizen_dj_audio_clip_' + Util.uniqueString() + '.wav';

    // for internet explorer
    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(blob, filename);
      return;
    }

    var url = window.URL.createObjectURL(blob);
    var anchorId = 'invisibleBufferAchnor';
    var anchor = document.getElementById(anchorId);
    if (!anchor) {
      var anchor = document.createElement('a')
      document.body.appendChild(anchor);
      anchor.id = anchorId;
      anchor.style = 'position: absolute; height: 1px; width: 1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap;';
    }
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    window.URL.revokeObjectURL(url);
  };

})();

var MIDIControl = (function() {

  function MIDIControl(config = {}) {
    var defaults = {};
    this.config = { ...defaults, ...config };
    this.load();
  }

  MIDIControl.prototype.load = function(){
    // this.el = document.getElementById('message');
    navigator.requestMIDIAccess().then( (midiAccess) => {
      this.onMIDILoad(midiAccess);
    }, (message) => {
      alert( "Failed to get MIDI access - " + message );
    } );
  };

  MIDIControl.prototype.refreshTracks = function(){
  };

  MIDIControl.prototype.onMIDILoad = function(midiAccess){
    console.log('Connected to MIDI', midiAccess);

    midiAccess.inputs.forEach( (entry) => {
      entry.onmidimessage = (event) => {
        this.onMIDIMessage(event);
      };
    });

    this.$togglePlay = $('.toggle-play').first();
    this.$bpm = $('#tempo');
    this.bpmMin = parseFloat(this.$bpm.attr('min'));
    this.bpmMax = parseFloat(this.$bpm.attr('max'));
    this.$pitch = $('#pitch');
    this.pitchMin = parseFloat(this.$pitch.attr('min'));
    this.pitchMax = parseFloat(this.$pitch.attr('max'));
    this.$randomize = $('.randomize-collection').first();
    this.$prevCollection = $('.prev-collection').first();
    this.$nextCollection = $('.next-collection').first();
    this.$prevDrum = $('.prev-drum').first();
    this.$nextDrum = $('.next-drum').first();

  };

  MIDIControl.prototype.onMIDIMessage = function(event){
    // console.log(event)

    var midiNum = event.data[1];
    var value = event.data[2] / 127;
    var track = 0;
    var trackCount = 8;
    var str = `${midiNum} ${value} ${Date.now()}`;

    // play
    if (midiNum === 41 && value >= 1.0) {
      var playText = this.$togglePlay.text().trim();
      if (playText == 'Play') {
        this.$togglePlay.trigger('click');
      }
      str += ' [play]';

    // stop
    } else if (midiNum === 42 && value >= 1.0) {
      var playText = this.$togglePlay.text().trim();
      if (playText != 'Play') {
        this.$togglePlay.trigger('click');
      }
      str += ' [stop]';

    // prev track
    } else if (midiNum === 58 && value >= 1.0) {
      this.$prevCollection.trigger('click');
      str += ' [prev track]';

    // next track
    } else if (midiNum === 59 && value >= 1.0) {
      this.$nextCollection.trigger('click');
      str += ' [next track]';

    // back
    } else if (midiNum === 43 && value >= 1.0) {
      this.$prevDrum.trigger('click');
      str += ' [back]';

    // forward
    } else if (midiNum === 44 && value >= 1.0) {
      this.$nextDrum.trigger('click');
      str += ' [forward]';

    // cycle / shuffle
    } else if (midiNum === 46 && value >= 1.0) {
      this.$randomize.trigger('click');
      str += ' [cycle]';

    // tempo
    } else if (midiNum === 16) {
      var newBpm = Math.round((1.0*this.bpmMax  - this.bpmMin) * value + this.bpmMin);
      this.$bpm.val(newBpm).trigger('input');
      str += ' [tempo]';

    // pitch
    } else if (midiNum === 17) {
      var newPitch = (1.0*this.pitchMax  - this.pitchMin) * value + this.pitchMin;
      this.$pitch.val(newPitch).trigger('input');
      str += ' [pitch]';

    // treble
    } else if (midiNum === 18) {
      str += ' [treble]';

    // track sliders
    } else if (midiNum < trackCount) {
      track = midiNum;
      $(document).trigger('track-volume', [track, value]);
      str += ' [track slider '+track+']';

    // track dials
    } else if (midiNum >= 16 && midiNum < (16+trackCount)) {
      track = midiNum - 16;
      str += ' [track dial '+track+']';

    // track solos
    } else if (midiNum >= 32 && midiNum < (32+trackCount)) {
      track = midiNum - 32;
      str += ' [track solo '+track+']';

    // track mutes
    } else if (midiNum >= 48 && midiNum < (48+trackCount)) {
      track = midiNum - 48;
      str += ' [track mute '+track+']';

    // track reverse
    } else if (midiNum >= 64 && midiNum < (64+trackCount)) {
      track = midiNum - 64;
      str += ' [track reverse '+track+']';
    }

    console.log(str);
    // this.el.textContent = str;

  };

  return MIDIControl;

})();
