/**
 * @author kovacsv / http://kovacsv.hu/
 * @author mrdoob / http://mrdoob.com/
 * @author mudcube / http://mudcu.be/
 */

THREE.STLBinaryExporter = function () {};

THREE.STLBinaryExporter.prototype = {

	constructor: THREE.STLBinaryExporter,

	parse: ( function () {

		var vector = new THREE.Vector3();
		var normalMatrixWorld = new THREE.Matrix3();

		return function parse( scene ) {

			// We collect objects first, as we may need to convert from BufferGeometry to Geometry
			var objects = [];
			var triangles = 0;

			scene.traverse( function ( object ) {

				if ( ! ( object instanceof THREE.Mesh ) ) return;

				var geometry = object.geometry;
				if ( geometry instanceof THREE.BufferGeometry ) {

					geometry = new THREE.Geometry().fromBufferGeometry( geometry );

				}

				if ( ! ( geometry instanceof THREE.Geometry ) ) return;
				triangles += geometry.faces.length;

				objects.push( {

					geometry: geometry,
					matrix: object.matrixWorld

				} );

			} );

			var offset = 80; // skip header
			var bufferLength = triangles * 2 + triangles * 3 * 4 * 4 + 80 + 4;
			var arrayBuffer = new ArrayBuffer( bufferLength );
			var output = new DataView( arrayBuffer );
			output.setUint32( offset, triangles, true ); offset += 4;

			// Traversing our collected objects
			objects.forEach( function ( object ) {

				var vertices = object.geometry.vertices;
				var faces = object.geometry.faces;

				normalMatrixWorld.getNormalMatrix( object.matrix );

				for ( var i = 0, l = faces.length; i < l; i ++ ) {

					var face = faces[ i ];

					vector.copy( face.normal ).applyMatrix3( normalMatrixWorld ).normalize();

					output.setFloat32( offset, vector.x, true ); offset += 4; // normal
					output.setFloat32( offset, vector.y, true ); offset += 4;
					output.setFloat32( offset, vector.z, true ); offset += 4;

					var indices = [ face.a, face.b, face.c ];

					for ( var j = 0; j < 3; j ++ ) {

						vector.copy( vertices[ indices[ j ] ] ).applyMatrix4( object.matrix );

						output.setFloat32( offset, vector.x, true ); offset += 4; // vertices
						output.setFloat32( offset, vector.y, true ); offset += 4;
						output.setFloat32( offset, vector.z, true ); offset += 4;

					}

					output.setUint16( offset, 0, true ); offset += 2; // attribute byte count

				}

			} );
			
			var output1=new Uint8Array( arrayBuffer);//,0,4 );
			//var output4=ArrayBufferToString(arrayBuffer);
			//alert(output3.byteLength);
			return output1;

			function ArrayBufferToString(buffer) {
				alert(buffer);
				return BinaryToString(String.fromCharCode.apply(null, Array.prototype.slice.apply(new Uint8Array(buffer))));
			}
			
			function StringToArrayBuffer(string) {
				return StringToUint8Array(string).buffer;
			}
			function BinaryToString(binary) {
				var error;
				alert(binary);
				try {
					return decodeURIComponent(escape(binary));
				} catch (_error) {
					error = _error;
					if (error instanceof URIError) {
						return binary;
					} else {
						alert(error);
						throw error;
					}
				}
			}
			
			function StringToBinary(string) {
				var chars, code, i, isUCS2, len, _i;
			
				len = string.length;
				chars = [];
				isUCS2 = false;
				for (i = _i = 0; 0 <= len ? _i < len : _i > len; i = 0 <= len ? ++_i : --_i) {
					code = String.prototype.charCodeAt.call(string, i);
					if (code > 255) {
						isUCS2 = true;
						chars = null;
						break;
					} else {
						chars.push(code);
					}
				}
				if (isUCS2 === true) {
					return unescape(encodeURIComponent(string));
				} else {
					return String.fromCharCode.apply(null, Array.prototype.slice.apply(chars));
				}
			}
			
			function StringToUint8Array(string) {
				var binary, binLen, buffer, chars, i, _i;
				binary = StringToBinary(string);
				binLen = binary.length;
				buffer = new ArrayBuffer(binLen);
				chars  = new Uint8Array(buffer);
				for (i = _i = 0; 0 <= binLen ? _i < binLen : _i > binLen; i = 0 <= binLen ? ++_i : --_i) {
					chars[i] = String.prototype.charCodeAt.call(binary, i);
				}
				return chars;
			}



		};

	}() )

};