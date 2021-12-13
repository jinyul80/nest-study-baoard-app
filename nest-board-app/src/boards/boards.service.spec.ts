import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from './board.entity';
import { BoardRepository } from './board.repository';
import { BoardsService } from './boards.service';

const mockRepository = () => ({
  crfeateBoard: jest.fn(),
  findOne: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('BoardsService', () => {
  let boardService: BoardsService;
  let boardRepository: MockRepository<BoardRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardsService,
        {
          provide: getRepositoryToken(BoardRepository),
          useValue: mockRepository(),
        },
      ],
    }).compile();

    boardService = module.get<BoardsService>(BoardsService);
    boardRepository = module.get(getRepositoryToken(BoardRepository));
  });

  it('should be defined', () => {
    expect(boardService).toBeDefined();
  });

  describe('findOne', () => {
    it('게시물 ID로 조회', async () => {
      const id = 1;

      const mockBoard = new Board();
      mockBoard.id = 1;
      mockBoard.title = '테스트1';
      mockBoard.description = '내용11';

      boardRepository.findOne.mockResolvedValue(mockBoard);

      try {
        await boardService.getBoardById(id);
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
      }

      const result = await boardService.getBoardById(id);
      expect(result).toBeInstanceOf(Board);
      expect(result).toEqual(mockBoard);
    });
  });
});
