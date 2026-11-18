import { Component, computed, inject, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Comment } from '../core/models';
import { UserService } from '../core/user.service';

@Component({
  selector: 'app-comment',
  imports: [RouterLink, DatePipe],
  template: `
    <div class="card">
      <div class="card-block">
        <p class="card-text">{{ data().body }}</p>
      </div>
      <div class="card-footer">
        <a class="comment-author" [routerLink]="['/@' + data().author.username]">
          <img [attr.src]="data().author.image" class="comment-author-img" />
        </a>
        &nbsp;
        <a class="comment-author" [routerLink]="['/@' + data().author.username]">{{
          data().author.username
        }}</a>
        <span class="date-posted">{{ data().createdAt | date: 'longDate' }}</span>
        @if (canModify()) {
          <span class="mod-options">
            <i class="ion-trash-a" (click)="deleted.emit()"></i>
          </span>
        }
      </div>
    </div>
  `,
})
export class CommentCard {
  readonly data = input.required<Comment>();
  readonly deleted = output<void>();
  private readonly user = inject(UserService);
  protected readonly canModify = computed(
    () => this.user.current()?.username === this.data().author.username,
  );
}
