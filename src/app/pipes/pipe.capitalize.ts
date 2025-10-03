import { Pipe, PipeTransform } from '@angular/core'


@Pipe({
    name: 'capitalize',
    standalone: true
})

export class CapitalizePipe implements PipeTransform {
    transform(value: string): string {
        if (!value) return '';

        return value
            .toLocaleLowerCase()
            .split(' ')
            .map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1))
            .join(' ');
    }
}