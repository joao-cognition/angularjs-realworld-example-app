import { Pipe, PipeTransform } from '@angular/core';

export const DEFAULT_AVATAR = '/default-avatar.svg';

@Pipe({ name: 'avatar' })
export class AvatarPipe implements PipeTransform {
  transform(image: string | null | undefined): string {
    return image?.trim() ? image : DEFAULT_AVATAR;
  }
}
