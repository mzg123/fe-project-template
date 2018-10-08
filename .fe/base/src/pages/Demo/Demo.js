import $ from 'zepto';
import './Demo.scss';

$('.con').on('click', () => {
    window.alert('click');
    window.console.log('click');
});
