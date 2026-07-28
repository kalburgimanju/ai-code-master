import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamMember } from './team-member.entity';

@Injectable()
export class TeamService {
  constructor(
    @InjectRepository(TeamMember)
    private readonly teamRepo: Repository<TeamMember>,
  ) {}

  async create(dto: Partial<TeamMember>): Promise<TeamMember> {
    return this.teamRepo.save(this.teamRepo.create(dto));
  }

  async findAll(): Promise<TeamMember[]> {
    return this.teamRepo.find();
  }

  async findOne(id: string): Promise<TeamMember | null> {
    return this.teamRepo.findOne({ where: { id } });
  }
}
