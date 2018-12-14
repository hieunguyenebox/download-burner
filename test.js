
const { download } = require('./dist')

download('https://statics.vntrip.vn/data-v2/hotels/3721/img_max/4C8B2805C9214F9B9386_42901879.jpg')
	.then(result => console.log(result))
	.catch(err => console.log(err))


download('https://releases.hashicorp.com/vagrant/2.2.2/vagrant_2.2.2_x86_64.dmg', {
		newName: 'test.dmg',
		dest: 'test'
	})
	.then(result => console.log(result))
	.catch(err => console.log(err))
